/**
 * Data access for contacts.
 *
 * The service layer never touches Mongoose directly. That keeps the service
 * unit-testable with a stub repository, and means a future storage change is
 * confined to this file.
 */
import Contact, { DELIVERY_STATUS } from "../models/Contact.js";

export const DUPLICATE_KEY_ERROR = 11000;

export const isDuplicateKeyError = (error) =>
  error?.code === DUPLICATE_KEY_ERROR || error?.cause?.code === DUPLICATE_KEY_ERROR;

/** Insert a submission in `pending` delivery state. Throws E11000 on duplicate. */
export async function insertPending(data) {
  return Contact.create({
    ...data,
    delivery: { status: DELIVERY_STATUS.PENDING, attempts: 0 },
  });
}

export function findByDedupeKey(dedupeKey) {
  return Contact.findOne({ dedupeKey }).exec();
}

/** Most recent submission with identical content inside the window. */
export function findRecentByHash(dedupeHash, windowMs) {
  return Contact.findOne({
    dedupeHash,
    createdAt: { $gte: new Date(Date.now() - windowMs) },
  })
    .sort({ createdAt: -1 })
    .exec();
}

export function markSent(id, { provider, providerMessageId, attempts }) {
  return Contact.findByIdAndUpdate(
    id,
    {
      $set: {
        "delivery.status": DELIVERY_STATUS.SENT,
        "delivery.provider": provider,
        "delivery.providerMessageId": providerMessageId,
        "delivery.attempts": attempts,
        "delivery.lastAttemptAt": new Date(),
        "delivery.sentAt": new Date(),
      },
      // Clear any error recorded by a previous failed attempt.
      $unset: { "delivery.lastError": "" },
    },
    { new: true }
  ).exec();
}

export function markFailed(id, { provider, attempts, error }) {
  return Contact.findByIdAndUpdate(
    id,
    {
      $set: {
        "delivery.status": DELIVERY_STATUS.FAILED,
        "delivery.provider": provider,
        "delivery.attempts": attempts,
        "delivery.lastAttemptAt": new Date(),
        // Truncated: provider errors can embed large payload echoes.
        "delivery.lastError": String(error?.message ?? error).slice(0, 500),
      },
    },
    { new: true }
  ).exec();
}

/** Backlog view for an ops script or a future retry worker. */
export function findUndelivered(limit = 50) {
  return Contact.find({
    "delivery.status": { $in: [DELIVERY_STATUS.PENDING, DELIVERY_STATUS.FAILED] },
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .exec();
}

export default {
  insertPending,
  findByDedupeKey,
  findRecentByHash,
  markSent,
  markFailed,
  findUndelivered,
  isDuplicateKeyError,
};
