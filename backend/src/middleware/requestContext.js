/**
 * Attaches a request id and a child logger to every request.
 *
 * Every log line for one submission shares a `requestId`, so a failure in
 * Render's log stream can be traced end to end. The id is echoed back as
 * `X-Request-Id`, which means a user reporting "it said it failed" hands you
 * the exact search key.
 */
import { randomUUID } from "node:crypto";
import logger from "../utils/logger.js";

export function requestContext(req, res, next) {
  const incoming = req.get("x-request-id");
  // Only trust an inbound id if it is short and simple — it goes into logs.
  const requestId =
    incoming && /^[\w-]{1,64}$/.test(incoming) ? incoming : randomUUID();

  req.id = requestId;
  req.log = logger.child({ requestId });
  res.setHeader("X-Request-Id", requestId);

  const startedAt = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    req.log[level](
      {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Math.round(durationMs),
      },
      "request completed"
    );
  });

  next();
}

export default requestContext;
