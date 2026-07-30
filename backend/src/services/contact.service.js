/**
 * Contact use-case orchestration.
 *
 * This is where the central guarantee lives: a 2xx is returned only after a
 * mail provider has accepted the message. The persisted row carries the
 * delivery outcome, so a failed send is a durable, queryable record rather
 * than a lost message.
 *
 * Order of operations, and why:
 *   1. persist as `pending`  — if the process dies mid-send the submission
 *                              still exists and is visibly undelivered.
 *   2. send (bounded + retried)
 *   3. record the outcome    — `sent` or `failed`, always.
 *   4. translate to an HTTP-shaped result for the controller.
 */
import crypto from "node:crypto";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { DELIVERY_STATUS } from "../models/Contact.js";
import repository from "../repositories/contact.repository.js";
import { sendContactNotification } from "./mail/mail.service.js";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

/**
 * Time-bucketed unique key.
 *
 * `dedupeHash` alone cannot be unique — the same person is allowed to send the
 * same text next week. Bucketing the hash by the dedupe window gives a value
 * that is unique *within* the window and free outside it, so a single unique
 * index enforces "no duplicates for N minutes" with no cleanup job.
 */
function buildDedupeKeys({ email, message }) {
  const dedupeHash = sha256(`${email.toLowerCase()}\n${message}`);
  const bucket = Math.floor(Date.now() / env.CONTACT_DEDUPE_WINDOW_MS);
  return { dedupeHash, dedupeKey: `${dedupeHash}:${bucket}` };
}

export const hashIp = (ip) =>
  ip ? sha256(`${env.IP_HASH_SALT}:${ip}`).slice(0, 32) : undefined;

/** Wait briefly for a concurrent request to finish sending the same message. */
async function awaitConcurrentDelivery(dedupeKey, { timeoutMs = 3_000, intervalMs = 250 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let existing = null;

  while (Date.now() < deadline) {
    existing = await repository.findByDedupeKey(dedupeKey);
    if (existing?.delivery?.status === DELIVERY_STATUS.SENT) return existing;
    if (existing?.delivery?.status === DELIVERY_STATUS.FAILED) return existing;
    // Not unref'd — a request is waiting on this poll.
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return existing;
}

/**
 * @param {object} input  Validated payload: { name, email, message }
 * @param {object} context { requestId, ip, userAgent, log }
 * @returns {Promise<{ contact: object, duplicate: boolean, delivery: object }>}
 */
export async function submitContact(input, context = {}) {
  const { requestId, ip, userAgent } = context;
  const log = (context.log ?? logger).child({ scope: "contact.service" });

  const { dedupeHash, dedupeKey } = buildDedupeKeys(input);

  // --- 1. Duplicate fast path ---------------------------------------------
  const recent = await repository.findRecentByHash(dedupeHash, env.CONTACT_DEDUPE_WINDOW_MS);
  if (recent?.delivery?.status === DELIVERY_STATUS.SENT) {
    log.info({ contactId: recent.id, dedupeHash }, "contact: duplicate within window, already delivered");
    return { contact: recent, duplicate: true, delivery: recent.delivery };
  }

  // --- 2. Persist (or adopt a previous undelivered attempt) ----------------
  let contact = recent ?? null;

  if (!contact) {
    try {
      contact = await repository.insertPending({
        name: input.name,
        email: input.email,
        message: input.message,
        dedupeHash,
        dedupeKey,
        requestId,
        ipHash: hashIp(ip),
        userAgent: userAgent?.slice(0, 512),
      });
      log.info({ contactId: contact.id }, "contact: saved as pending");
    } catch (error) {
      if (!repository.isDuplicateKeyError(error)) throw error;

      // A concurrent identical request won the unique index. Do not create a
      // second row and do not send a second email — wait for its outcome.
      log.warn({ dedupeKey }, "contact: concurrent duplicate detected");
      const settled = await awaitConcurrentDelivery(dedupeKey);

      if (settled?.delivery?.status === DELIVERY_STATUS.SENT) {
        return { contact: settled, duplicate: true, delivery: settled.delivery };
      }
      throw AppError.conflict(
        "This message is already being processed. Please wait a moment before retrying.",
        { details: { dedupeKey } }
      );
    }
  } else {
    log.info(
      { contactId: contact.id, previousStatus: contact.delivery?.status },
      "contact: retrying delivery for existing submission"
    );
  }

  // --- 3. Send, bounded and retried ---------------------------------------
  try {
    const result = await sendContactNotification(
      {
        name: contact.name,
        email: contact.email,
        message: contact.message,
        submittedAt: contact.createdAt,
        contactId: contact.id,
      },
      { idempotencyKey: contact.dedupeKey, log }
    );

    const updated = await repository.markSent(contact.id, {
      provider: result.provider,
      providerMessageId: result.messageId,
      attempts: result.attempts,
    });

    log.info(
      { contactId: contact.id, provider: result.provider, messageId: result.messageId },
      "contact: delivered"
    );

    return { contact: updated ?? contact, duplicate: false, delivery: updated?.delivery };
  } catch (error) {
    // The submission is preserved and flagged; only the notification failed.
    await repository
      .markFailed(contact.id, {
        provider: error?.provider,
        attempts: error?.attempts ?? env.MAIL_MAX_ATTEMPTS,
        error,
      })
      .catch((dbError) =>
        log.error({ err: dbError, contactId: contact.id }, "contact: failed to record delivery failure")
      );

    log.error(
      {
        contactId: contact.id,
        provider: error?.provider,
        statusCode: error?.statusCode,
        providerCode: error?.providerCode,
        err: error?.message,
      },
      "contact: delivery failed"
    );

    throw AppError.badGateway(
      "We saved your message but could not deliver the notification. Please email me directly.",
      { code: "MAIL_DELIVERY_FAILED", cause: error, details: { contactId: contact.id } }
    );
  }
}

export default { submitContact };
