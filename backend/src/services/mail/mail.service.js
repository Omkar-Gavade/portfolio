/**
 * Reusable mail service — the only thing the rest of the app talks to.
 *
 * Responsibilities that used to live in the controller and now live here:
 *   - provider selection (Resend primary, SMTP as opt-in fallback)
 *   - per-attempt timeout + total wall-clock budget
 *   - retry policy for transient failures only
 *   - idempotency key propagation so a retried ambiguous send cannot duplicate
 *   - structured logging of every attempt
 *
 * Contract: `sendContactNotification` resolves ONLY when a provider has
 * accepted the message and returned an id. Anything else throws. Callers can
 * therefore treat resolution as proof of delivery hand-off, which is what
 * makes "never return success unless it happened" enforceable.
 */
import env from "../../config/env.js";
import logger from "../../utils/logger.js";
import retry from "../../utils/retry.js";
import { createDeadline } from "../../utils/withTimeout.js";
import MailError from "./MailError.js";
import resendProvider from "./resend.provider.js";
import smtpProvider from "./smtp.provider.js";
import contactNotification from "./templates/contactNotification.js";

const PROVIDERS = { resend: resendProvider, smtp: smtpProvider };

/** Primary first, then the fallback if enabled and configured differently. */
function resolveProviderChain() {
  const primary = PROVIDERS[env.MAIL_PROVIDER];
  const chain = [primary];

  if (env.MAIL_FALLBACK_ENABLED) {
    const fallback = env.MAIL_PROVIDER === "resend" ? smtpProvider : resendProvider;
    if (fallback.isConfigured()) chain.push(fallback);
  }

  return chain;
}

/**
 * Send one message through a single provider, retrying transient failures
 * inside the remaining budget.
 */
async function sendViaProvider(provider, message, { deadline, log }) {
  let attempts = 0;

  const result = await retry(
    async (attempt) => {
      attempts = attempt;
      deadline.assertNotExpired(`mail:${provider.name}`);

      const startedAt = Date.now();
      log.info({ provider: provider.name, attempt }, "mail: attempt started");

      const sent = await provider.send(message);

      log.info(
        {
          provider: provider.name,
          attempt,
          messageId: sent.messageId,
          durationMs: Date.now() - startedAt,
        },
        "mail: accepted by provider"
      );
      return sent;
    },
    {
      maxAttempts: env.MAIL_MAX_ATTEMPTS,
      baseDelayMs: env.MAIL_RETRY_BASE_DELAY_MS,
      deadline,
      isRetryable: (error) => error instanceof MailError && error.retryable,
      onRetry: ({ attempt, delayMs, error }) =>
        log.warn(
          {
            provider: provider.name,
            attempt,
            delayMs,
            statusCode: error?.statusCode,
            providerCode: error?.providerCode,
            err: error?.message,
          },
          "mail: attempt failed, retrying"
        ),
    }
  );

  return { ...result, attempts };
}

/**
 * @param {object} contact             { name, email, message, submittedAt, contactId }
 * @param {object} [options]
 * @param {string} [options.idempotencyKey]
 * @param {import('pino').Logger} [options.log]
 * @returns {Promise<{ provider: string, messageId: string, attempts: number }>}
 * @throws {MailError} when no provider accepted the message
 */
export async function sendContactNotification(contact, { idempotencyKey, log = logger } = {}) {
  const deadline = createDeadline(env.MAIL_TOTAL_BUDGET_MS);
  const template = contactNotification(contact);
  const message = { ...template, idempotencyKey };

  const chain = resolveProviderChain();
  let lastError;
  let totalAttempts = 0;

  for (const provider of chain) {
    if (!provider.isConfigured()) {
      log.warn({ provider: provider.name }, "mail: provider not configured, skipping");
      continue;
    }

    try {
      const result = await sendViaProvider(provider, message, { deadline, log });
      return { ...result, attempts: totalAttempts + result.attempts };
    } catch (error) {
      lastError = error;
      totalAttempts += env.MAIL_MAX_ATTEMPTS;
      log.error(
        {
          provider: provider.name,
          statusCode: error?.statusCode,
          providerCode: error?.providerCode,
          elapsedMs: deadline.elapsed(),
          err: error?.message,
        },
        "mail: provider exhausted"
      );
      if (deadline.expired()) break;
    }
  }

  throw (
    lastError ??
    new MailError("No mail provider is configured", { provider: "none", retryable: false })
  );
}

/**
 * Boot-time credential check. Non-fatal by design: a provider outage at deploy
 * time should not prevent the API from serving, but it MUST be loud in the
 * logs so the failure is discovered now and not from a missing message later.
 */
export async function verifyMailProviders() {
  const results = [];
  for (const provider of resolveProviderChain()) {
    if (!provider.isConfigured()) {
      logger.warn({ provider: provider.name }, "mail: provider not configured");
      results.push({ provider: provider.name, ok: false, reason: "not configured" });
      continue;
    }
    const outcome = await provider.verify();
    results.push({ provider: provider.name, ...outcome });
    if (outcome.ok) logger.info({ provider: provider.name }, "mail: provider verified");
    else logger.error({ provider: provider.name, reason: outcome.reason }, "mail: provider verification FAILED");
  }
  return results;
}

export async function closeMailProviders() {
  await smtpProvider.close?.();
}

export default { sendContactNotification, verifyMailProviders, closeMailProviders };
