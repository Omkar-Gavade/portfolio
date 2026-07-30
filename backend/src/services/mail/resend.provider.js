/**
 * Resend provider — implemented against the HTTP API with native `fetch`
 * rather than the `resend` SDK.
 *
 * Why not the SDK: the SDK does not expose a per-request AbortSignal, and an
 * un-abortable outbound call is exactly the failure mode this refactor exists
 * to eliminate. Raw fetch gives us a real deadline, real socket release on
 * timeout, and status-code-accurate retry classification — for one endpoint
 * and ~60 lines, that is the better trade. Swap to the SDK by rewriting only
 * this file; nothing above it knows the difference.
 */
import env from "../../config/env.js";
import { timeoutSignal } from "../../utils/withTimeout.js";
import MailError, { isTransientNetworkError } from "./MailError.js";

const NAME = "resend";

/**
 * 408/409/429 and every 5xx are transient. 401/403 (bad key), 422 (invalid
 * payload or unverified domain) and 400 are permanent — retrying those wastes
 * the budget and pushes us into provider rate limits for no reason.
 */
const isRetryableStatus = (status) =>
  status === 408 || status === 409 || status === 429 || (status >= 500 && status <= 599);

async function readBody(response) {
  const text = await response.text().catch(() => "");
  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

export const resendProvider = {
  name: NAME,

  isConfigured: () => Boolean(env.RESEND_API_KEY),

  /**
   * @param {object} message
   * @param {string} message.subject
   * @param {string} message.text
   * @param {string} [message.html]
   * @param {string} [message.replyTo]
   * @param {string} [message.idempotencyKey] Resend de-duplicates on this for
   *        24h, so a retry after an ambiguous timeout cannot double-send.
   * @returns {Promise<{ provider: string, messageId: string }>}
   */
  async send({ subject, text, html, replyTo, idempotencyKey }) {
    const { signal, cancel } = timeoutSignal(env.MAIL_TIMEOUT_MS);

    try {
      const response = await fetch(`${env.RESEND_BASE_URL}/emails`, {
        method: "POST",
        signal,
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        },
        body: JSON.stringify({
          from: env.MAIL_FROM,
          to: [env.MAIL_TO],
          subject,
          text,
          ...(html ? { html } : {}),
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });

      const { json, text: raw } = await readBody(response);

      if (!response.ok) {
        const detail = json?.message ?? json?.error?.message ?? raw.slice(0, 300);
        throw new MailError(`Resend rejected the message (${response.status}): ${detail}`, {
          provider: NAME,
          retryable: isRetryableStatus(response.status),
          statusCode: response.status,
          providerCode: json?.name,
        });
      }

      if (!json?.id) {
        // 2xx with no id means we cannot prove acceptance — treat as failure.
        throw new MailError("Resend returned success without a message id", {
          provider: NAME,
          retryable: true,
          statusCode: response.status,
        });
      }

      return { provider: NAME, messageId: json.id };
    } catch (error) {
      if (error instanceof MailError) throw error;

      const aborted = error?.name === "AbortError" || signal.aborted;
      throw new MailError(
        aborted
          ? `Resend request timed out after ${env.MAIL_TIMEOUT_MS}ms`
          : `Resend request failed: ${error?.message ?? error}`,
        {
          provider: NAME,
          // A timeout is ambiguous (the send may have landed) — the
          // idempotency key makes retrying safe anyway.
          retryable: aborted || isTransientNetworkError(error),
          cause: error,
        }
      );
    } finally {
      cancel();
    }
  },

  /** Cheap credential check used at boot. Never throws. */
  async verify() {
    const { signal, cancel } = timeoutSignal(env.MAIL_TIMEOUT_MS);
    try {
      const response = await fetch(`${env.RESEND_BASE_URL}/domains`, {
        method: "GET",
        signal,
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
      });
      if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: `API key rejected (${response.status})` };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error?.message ?? String(error) };
    } finally {
      cancel();
    }
  },
};

export default resendProvider;
