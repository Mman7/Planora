import type { Context } from "hono";
import type { AppEnv } from "../../config/env";
import { UnauthorizedError } from "../../lib/errors";
import { createRequestAuth } from "./auth";

export async function requireUserId(c: Context<AppEnv>): Promise<string> {
  const session = await createRequestAuth(c.env).api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  return session.user.id;
}
