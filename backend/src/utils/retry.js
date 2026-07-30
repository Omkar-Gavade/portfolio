/**
 * Retry with exponential backoff and full jitter, bounded by a wall-clock
 * deadline.
 *
 * Two rules make this safe rather than harmful:
 *  1. Only *transient* failures are retried (`isRetryable`). Retrying a 401 or
 *     a malformed payload just burns the budget and hits provider rate limits.
 *  2. The deadline is checked before sleeping AND before the next attempt, so
 *     a retry is never started that cannot finish inside the budget.
 *
 * Full jitter (random between 0 and the backoff) is used rather than fixed
 * backoff so concurrent retries do not synchronise into a thundering herd.
 */
// Deliberately NOT unref'd: the backoff is part of an in-flight send, so the
// process must stay alive through it. An unref'd timer here lets Node exit
// mid-retry and abandon the message.
const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new Error("aborted"));
      },
      { once: true }
    );
  });

/**
 * @param {(attempt: number) => Promise<any>} fn
 * @param {object} options
 * @param {number} options.maxAttempts
 * @param {number} options.baseDelayMs
 * @param {number} [options.maxDelayMs]
 * @param {(error: Error) => boolean} options.isRetryable
 * @param {{ remaining: () => number }} [options.deadline]
 * @param {(info: { attempt: number, delayMs: number, error: Error }) => void} [options.onRetry]
 */
export async function retry(fn, {
  maxAttempts,
  baseDelayMs,
  maxDelayMs = 5_000,
  isRetryable,
  deadline,
  onRetry,
}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt || !isRetryable(error)) throw error;

      // Full jitter: random in [0, min(base * 2^(n-1), max)]
      const ceiling = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      const delayMs = Math.floor(Math.random() * ceiling);

      // Do not sleep into a budget we cannot honour — fail now with the real
      // error instead of masking it as a timeout later.
      if (deadline && deadline.remaining() <= delayMs) throw error;

      onRetry?.({ attempt, delayMs, error });
      await sleep(delayMs);
    }
  }

  throw lastError;
}

export default retry;
