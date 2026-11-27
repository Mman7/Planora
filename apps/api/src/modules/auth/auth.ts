import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { createDatabase, type Database } from "@repo/database";
import type { Bindings } from "../../config/env";

export function createAuth(env: Bindings, database: Database) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "sqlite",
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ?? "http://localhost:8787",
    trustedOrigins: [env.CORS_ORIGIN ?? "http://localhost:3000"],
    emailAndPassword: {
      enabled: true,
    },
  });
}

export function createRequestAuth(env: Bindings) {
  return createAuth(env, createDatabase(env.DB));
}
