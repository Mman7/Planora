import type { ErrorHandler } from "hono";
import { AppError } from "../lib/errors";
import { errorResponse } from "../lib/response";
import type { Bindings, AppVariables } from "../config/env";

export const errorMiddleware: ErrorHandler<{
  Bindings: Bindings;
  Variables: AppVariables;
}> = (error, c) => {
  if (error instanceof AppError) {
    return c.json(errorResponse(error.code, error.message), error.status as 400);
  }

  console.error(error);
  return c.json(errorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred"), 500);
};
