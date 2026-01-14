import { Hono } from "hono";
import { createRequestHandler } from "react-router";
import { cors } from "hono/cors";
import Stripe from "stripe";
import { hash, compare } from "bcryptjs";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";

type Bindings = {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  FRONTEND_URL: string;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use("/api/*", cors());

const PAGE_SIZE = 5;

// API Routes

// Get all comments
app.get("/api/comments", async (c) => {
  try {
    const pageParam = Number.parseInt(c.req.query("page") ?? "1", 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

    const countRow = await c.env.DB.prepare(
      "SELECT COUNT(*) AS total FROM comments"
    ).first<{ total: number }>();
    const totalCount = countRow?.total ?? 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const effectivePage =
      totalPages > 0 ? Math.min(page, totalPages) : 1;
    const offset = (effectivePage - 1) * PAGE_SIZE;

    const { results } = await c.env.DB.prepare(
      "SELECT id, user, comment, addtime FROM comments ORDER BY id DESC LIMIT ? OFFSET ?"
    )
      .bind(PAGE_SIZE, offset)
      .all();

    return c.json({
      comments: results ?? [],
      page: effectivePage,
      pageSize: PAGE_SIZE,
      totalCount,
      totalPages,
      hasMore: effectivePage < totalPages,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
});

// Auth Routes

// Signup
app.post("/api/auth/signup", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  try {
    const existingUser = await c.env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    )
      .bind(email)
      .first();

    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    const passwordHash = await hash(password, 10);
    const verificationToken = crypto.randomUUID();

    await c.env.DB.prepare(
      "INSERT INTO users (email, password_hash, verification_token) VALUES (?, ?, ?)"
    )
      .bind(email, passwordHash, verificationToken)
      .run();

    const verificationLink = `/verify?token=${verificationToken}`;

    // In a real app, send email here. For now, return link.
    return c.json({
      message: "Please check your email to verify your account.",
      verificationLink,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// Verify
app.post("/api/auth/verify", async (c) => {
  const { token } = await c.req.json();

  if (!token) {
    return c.json({ error: "Token required" }, 400);
  }

  try {
    const user = await c.env.DB.prepare(
      "SELECT id FROM users WHERE verification_token = ?"
    )
      .bind(token)
      .first();

    if (!user) {
      return c.json({ error: "Invalid token" }, 400);
    }

    await c.env.DB.prepare(
      "UPDATE users SET is_verified = TRUE, email_verified_at = datetime('now'), verification_token = NULL WHERE id = ?"
    )
      .bind(user.id)
      .run();

    return c.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    return c.json({ error: "Verification failed" }, 500);
  }
});

// Login
app.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  try {
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    )
      .bind(email)
      .first<any>();

    if (!user || !(await compare(password, user.password_hash))) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    if (!user.is_verified) {
      return c.json({ error: "Please verify your email first" }, 403);
    }

    const token = await sign(
      { id: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, // 1 day
      c.env.JWT_SECRET
    );

    setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return c.json({
      user: { id: user.id, email: user.email, is_verified: user.is_verified },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Logout
app.post("/api/auth/logout", (c) => {
  deleteCookie(c, "auth_token");
  return c.json({ message: "Logged out" });
});

// Me (Get Current User)
app.get("/api/auth/me", async (c) => {
  const token = getCookie(c, "auth_token");

  if (!token) {
    return c.json({ user: null });
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    return c.json({ user: payload });
  } catch (error) {
    return c.json({ user: null });
  }
});

// Create Stripe checkout session
app.post("/api/create-checkout-session", async (c) => {
  const token = getCookie(c, "auth_token");

  if (!token) {
     return c.json({ requiresAuth: true });
  }

  let user;
  try {
    user = await verify(token, c.env.JWT_SECRET);
  } catch (e) {
     return c.json({ requiresAuth: true });
  }

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia" as any, // Cast to any because the type definition might not be updated yet
  });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Premium Voices Subscription",
            },
            unit_amount: 1000, // $10.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${c.env.FRONTEND_URL}?success=true`,
      cancel_url: `${c.env.FRONTEND_URL}?canceled=true`,
      customer_email: user.email as string,
    });

    return c.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return c.json({ error: error.message }, 500);
  }
});

app.get("*", (c) => {
  const requestHandler = createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE,
  );

  return requestHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx },
  });
});

export default app;
