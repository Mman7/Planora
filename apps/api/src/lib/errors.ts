export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;

  public constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export class InternalServerError extends AppError {
  public constructor() {
    super("INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
  }
}

export class UnauthorizedError extends AppError {
  public constructor() {
    super("UNAUTHORIZED", "Authentication required", 401);
  }
}

export class NotFoundError extends AppError {
  public constructor(code: string, message: string) {
    super(code, message, 404);
  }
}

export class ConflictError extends AppError {
  public constructor(code: string, message: string) {
    super(code, message, 409);
  }
}
