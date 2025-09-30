import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

// Health check endpoint
app.get("/make-server-28e61d13/health", (c) => {
  return c.json({ status: "ok" });
});

// Get saved canvas data for user
app.get("/canvas/:userId", async (c) => {
  const userId = c.req.param("userId");
  try {
    const data = await kv.get(`canvas_${userId}`);
    return c.json({ canvasData: data || null });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Save canvas data for user
app.post("/canvas/:userId", async (c) => {
  const userId = c.req.param("userId");
  const json = await c.req.json();
  try {
    await kv.set(`canvas_${userId}`, json);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get community explore designs (mock)
app.get("/explore", async (c) => {
  const mockDesigns = [
    {
      id: "1",
      title: "Traditional Pulli Kolam",
      creator: "Priya Sharma",
      imageUrl: "https://images.unsplash.com/photo-1604374376934-2df6fad6519b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      likes: 245,
      comments: 18,
      tags: ["traditional", "pulli", "dots", "symmetric"],
      complexity: "Intermediate",
      gridType: "Rectangular",
      createdAt: "2024-01-15",
      description: "A beautiful traditional Pulli Kolam with intricate dot connections representing prosperity."
    },
    // add more designs as needed
  ];
  return c.json({ designs: mockDesigns });
});

Deno.serve(app.fetch);
