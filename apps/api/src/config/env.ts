import type { D1Database } from "@cloudflare/workers-types";

export type Bindings = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  CORS_ORIGIN?: string;
};

export type AppVariables = {
  requestId: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: AppVariables;
};
