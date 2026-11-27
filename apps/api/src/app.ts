import { cors } from "hono/cors";
import { Hono } from "hono";
import type { AppEnv, Bindings } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { successResponse } from "./lib/response";
import { getCurrentUser } from "./modules/auth/auth.controller";
import { createRequestAuth } from "./modules/auth/auth";
import { projectRoutes } from "./modules/projects/project.routes";
import { planningRoutes } from "./modules/planning/planning.routes";

export function createApp() {
  const app = new Hono<AppEnv>();

  app.use("*", async (c, next) => {
    c.set("requestId", crypto.randomUUID());
    await next();
  });
  app.use(
    "/api/*",
    cors({
      origin: (_origin, c) => (c.env as Bindings).CORS_ORIGIN ?? "http://localhost:3000",
      credentials: true,
    }),
  );

  app.get("/api/health", async (c) => {
    await c.env.DB.prepare("SELECT 1 AS connected").first();
    return c.json(successResponse({ status: "healthy", database: "connected" }));
  });

  // put the auth routes before the project and planning routes
  app.get("/api/auth/me", getCurrentUser);
  app.on(["GET", "POST"], "/api/auth/*", (c) => {
    return createRequestAuth(c.env).handler(c.req.raw);
  });
  app.route("/api/projects", projectRoutes);
  app.route("/api/projects", planningRoutes);

  app.notFound((c) =>
    c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Route not found" },
      },
      404,
    ),
  );
  app.onError(errorMiddleware);

  return app;
}
