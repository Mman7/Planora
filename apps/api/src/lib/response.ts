export function successResponse<T>(data: T, message?: string) {
  return {
    success: true as const,
    data,
    ...(message ? { message } : {}),
  };
}

export function errorResponse(code: string, message: string) {
  return {
    success: false as const,
    error: { code, message },
  };
}
