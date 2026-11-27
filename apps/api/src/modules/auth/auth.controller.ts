import type { Context } from "hono";
import { createRequestAuth } from "./auth";
import type { AppEnv } from "../../config/env";
import { successResponse } from "../../lib/response";

export async function getCurrentUser(c: Context<AppEnv>) {
  const auth = createRequestAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      },
      401,
    );
  }

  return c.json(successResponse({ user: session.user }));
}
