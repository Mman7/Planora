import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  dbCredentials: {
    url: "./drizzle/local.db",
  },
  schema: "./src/schema/index.ts",
  out: "./drizzle/migrations",
  strict: true,
  verbose: true,
});
