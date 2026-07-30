/**
 * Generic Zod validation middleware.
 *
 * On success the parsed (trimmed, lowercased, unknown-keys-stripped) value
 * replaces `req.body`, so downstream code works with clean data only.
 * On failure it produces a 400 with per-field messages the form can render.
 */
import AppError from "../utils/AppError.js";

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});

  if (!result.success) {
    const fieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "_";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }

    return next(
      AppError.badRequest(Object.values(fieldErrors)[0] ?? "Invalid request", {
        details: { fields: fieldErrors },
      })
    );
  }

  req.body = result.data;
  return next();
};

export default validateBody;
