import { Hono } from "hono";
import { createRequestHandler } from "react-router";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
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

// Add a new comment
app.post("/api/comments", async (c) => {
  try {
    const body = await c.req.json();
    const { user, txt } = body;

    // Validation
    if (!user || user.trim() === "") {
      return c.json({ code: 355, message: "名字不能为空！" }, 400);
    }
    if (!txt || txt.trim() === "") {
      return c.json({ code: 356, message: "内容不能为空" }, 400);
    }

    // Sanitize input (basic)
    const sanitizedUser = user.trim().substring(0, 50);
    const sanitizedTxt = txt.trim().substring(0, 4096);
    const time = new Date().toISOString();

    // Insert comment
    await c.env.DB.prepare(
      "INSERT INTO comments (user, comment, addtime) VALUES (?, ?, ?)"
    )
      .bind(sanitizedUser, sanitizedTxt, time)
      .run();

    return c.json({
      code: 1,
      message: "success",
      user: sanitizedUser,
      txt: sanitizedTxt,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return c.json({ error: "Failed to add comment" }, 500);
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
