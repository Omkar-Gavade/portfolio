/**
 * Operational error: an outcome we anticipated and can describe to the client.
 *
 * Anything that is NOT an AppError is treated by the error middleware as a
 * programmer bug — logged at error level with a stack, and reported to the
 * client as a generic 500 with no internals leaked.
 */
export class AppError extends Error {
  /**
   * @param {number} statusCode  HTTP status to return
   * @param {string} message     Safe, client-facing message
   * @param {object} [options]
   * @param {string} [options.code]     Stable machine-readable code
   * @param {object} [options.details]  Extra context for logs (never sent as-is)
   * @param {Error}  [options.cause]    Underlying error
   * @param {boolean}[options.expose]   Send `message` to client (default true)
   */
  constructor(statusCode, message, { code, details, cause, expose = true } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? "ERROR";
    this.details = details;
    this.expose = expose;
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message, options) {
    return new AppError(400, message, { code: "VALIDATION_ERROR", ...options });
  }

  static tooManyRequests(message, options) {
    return new AppError(429, message, { code: "RATE_LIMITED", ...options });
  }

  static conflict(message, options) {
    return new AppError(409, message, { code: "CONFLICT", ...options });
  }

  /** Upstream dependency (mail provider) failed — not the client's fault. */
  static badGateway(message, options) {
    return new AppError(502, message, { code: "UPSTREAM_FAILURE", ...options });
  }

  static serviceUnavailable(message, options) {
    return new AppError(503, message, { code: "SERVICE_UNAVAILABLE", ...options });
  }
}

export default AppError;
