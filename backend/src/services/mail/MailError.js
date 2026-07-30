/**
 * Normalised mail failure.
 *
 * Every provider reports failure in its own shape (HTTP status, SMTP response
 * code, socket errno). The retry policy needs one question answered — "is this
 * worth trying again?" — so each provider translates its own failures into
 * this type and sets `retryable` once, at the boundary.
 */
export class MailError extends Error {
  constructor(message, { provider, retryable = false, statusCode, providerCode, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "MailError";
    this.provider = provider;
    this.retryable = retryable;
    this.statusCode = statusCode;
    this.providerCode = providerCode;
  }
}

/**
 * Transient network conditions, shared by every transport.
 * A connection that was refused/reset/timed out told us nothing about whether
 * the message was accepted, and retrying is the correct response.
 */
export const TRANSIENT_NET_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ESOCKETTIMEDOUT",
  "EPIPE",
  "EAI_AGAIN",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);

export const isTransientNetworkError = (error) => {
  const code = error?.code ?? error?.cause?.code ?? error?.errno;
  return TRANSIENT_NET_CODES.has(code) || error?.isTimeout === true;
};

export default MailError;
