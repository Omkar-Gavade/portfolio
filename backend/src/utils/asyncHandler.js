/**
 * Wraps an async route handler so a rejected promise reaches `next()`.
 *
 * Express 5 already forwards rejections from async handlers, but wrapping
 * explicitly keeps the behaviour identical if the app is ever downgraded or a
 * handler is reused outside a router, and it documents intent at the call site.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
