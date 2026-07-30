/**
 * Terminal error middleware — the single place that turns an error into a
 * response. No controller formats its own error response any more.
 *
 * Rules:
 *  - `AppError` is trusted: its status and message go to the client.
 *  - Known infrastructure errors are mapped to honest statuses (503 for a
 *    database that is down, 400 for malformed JSON) instead of a blanket 500.
 *  - Everything else is a bug: full stack to the logs, generic message out.
 *    Internal details never reach the client.
 *  - The response shape stays `{ success, message }` so the existing frontend
 *    contract is untouched.
 */
import mongoose from "mongoose";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

/** `instanceof` against a constructor that may not exist throws — guard it. */
const isInstanceOf = (error, Constructor) =>
  typeof Constructor === "function" && error instanceof Constructor;

function normalise(error) {
  if (error instanceof AppError) return error;

  // Malformed JSON body — express.json() raises a SyntaxError with .status
  if (error instanceof SyntaxError && "body" in error) {
    return AppError.badRequest("Request body is not valid JSON", { cause: error });
  }

  // Schema validation that slipped past Zod (defence in depth)
  if (isInstanceOf(error, mongoose.Error.ValidationError)) {
    const first = Object.values(error.errors)[0]?.message ?? "Invalid data";
    return AppError.badRequest(first, { cause: error });
  }

  // Database unreachable / not connected — the client should retry, not us.
  if (
    isInstanceOf(error, mongoose.Error.MongooseServerSelectionError) ||
    error?.name === "MongooseServerSelectionError" ||
    error?.name === "MongoNetworkError" ||
    /buffering timed out|Client must be connected/i.test(error?.message ?? "")
  ) {
    return AppError.serviceUnavailable(
      "Service temporarily unavailable. Please try again shortly.",
      { code: "DB_UNAVAILABLE", cause: error }
    );
  }

  if (error?.code === 11000) {
    return AppError.conflict("This message was already received.", { cause: error });
  }

  return new AppError(500, "Internal server error", {
    code: "INTERNAL_ERROR",
    cause: error,
    expose: false,
  });
}

// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity
export function errorHandler(error, req, res, next) {
  const appError = normalise(error);
  const log = req.log ?? logger;

  const payload = {
    requestId: req.id,
    status: appError.statusCode,
    code: appError.code,
    path: req.originalUrl,
    method: req.method,
    details: appError.details,
    err: appError.cause ?? appError,
  };

  if (appError.statusCode >= 500) log.error(payload, "request failed");
  else log.warn(payload, "request rejected");

  // Headers already flushed — hand back to Express to destroy the socket.
  if (res.headersSent) return next(error);

  return res.status(appError.statusCode).json({
    success: false,
    message: appError.expose ? appError.message : "Internal server error",
    code: appError.code,
    requestId: req.id,
    ...(env.isProduction ? {} : { details: appError.details }),
  });
}

export default errorHandler;
