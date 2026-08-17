export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function notFound(message = "Resource not found"): AppError {
  return new AppError(404, message, "NOT_FOUND");
}

export function unauthorized(message = "Unauthorized"): AppError {
  return new AppError(401, message, "UNAUTHORIZED");
}

export function forbidden(message = "Forbidden"): AppError {
  return new AppError(403, message, "FORBIDDEN");
}

export function conflict(message: string): AppError {
  return new AppError(409, message, "CONFLICT");
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(400, message, "BAD_REQUEST", details);
}
