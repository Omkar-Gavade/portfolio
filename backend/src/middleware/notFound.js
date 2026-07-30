import AppError from "../utils/AppError.js";

/** Anything that reaches here matched no route. */
export function notFound(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, { code: "NOT_FOUND" }));
}

export default notFound;
