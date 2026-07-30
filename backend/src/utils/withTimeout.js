/**
 * Timeout helpers.
 *
 * A hung SMTP/HTTP socket is the single most common cause of "the API said OK
 * but nothing happened": without an explicit deadline the request thread waits
 * on the OS TCP timeout (minutes), the client gives up first, and the outcome
 * is never recorded. Every outbound call in this codebase carries a deadline.
 */
import AppError from "./AppError.js";

export class TimeoutError extends Error {
  constructor(ms, label) {
    super(`${label ?? "Operation"} timed out after ${ms}ms`);
    this.name = "TimeoutError";
    this.timeoutMs = ms;
    this.isTimeout = true;
  }
}

/**
 * Races a promise against a deadline. Use for work that cannot be aborted
 * (the underlying operation keeps running; we just stop waiting on it).
 */
export async function withTimeout(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new TimeoutError(ms, label)), ms);
        timer.unref?.();
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Creates an AbortSignal that fires after `ms`, plus a cleanup function.
 * Preferred over `withTimeout` for fetch, because aborting actually releases
 * the socket instead of leaking it.
 */
export function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new TimeoutError(ms, "request")), ms);
  timer.unref?.();
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

/** A monotonic budget: "how much wall-clock time is left for this operation". */
export function createDeadline(totalMs) {
  const start = Date.now();
  return {
    remaining: () => Math.max(0, totalMs - (Date.now() - start)),
    elapsed: () => Date.now() - start,
    expired: () => Date.now() - start >= totalMs,
    assertNotExpired(label) {
      if (this.expired()) {
        throw AppError.badGateway("Could not deliver your message. Please try again.", {
          code: "DEADLINE_EXCEEDED",
          details: { label, totalMs },
        });
      }
    },
  };
}
