import { Hono } from "hono";
import { createRequestHandler } from "react-router";
import { cors } from "hono/cors";
import Stripe from "stripe";

type Bindings = {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  FRONTEND_URL: string;
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

// Create Stripe checkout session
app.post("/api/create-checkout-session", async (c) => {
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
