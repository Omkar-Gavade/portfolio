import mongoose from "mongoose";

/**
 * Delivery states for the notification email attached to a submission.
 *
 * The row is the durable record of intent; `delivery` is the record of what
 * actually happened to it. Keeping them in one document means a failed send is
 * never lost — it is a queryable row you can retry or read manually.
 */
export const DELIVERY_STATUS = Object.freeze({
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed",
});

const deliverySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.PENDING,
      index: true,
    },
    provider: { type: String },        // "resend" | "smtp"
    providerMessageId: { type: String },
    attempts: { type: Number, default: 0 },
    lastError: { type: String },       // truncated, no secrets
    lastAttemptAt: { type: Date },
    sentAt: { type: Date },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    message: { type: String, required: true, maxlength: 5000 },

    delivery: { type: deliverySchema, default: () => ({}) },

    /**
     * sha256(email + "\n" + message). Non-unique: identical content is legal
     * once the dedupe window has passed. Used for the fast duplicate lookup.
     */
    dedupeHash: { type: String, required: true, index: true },

    /**
     * `${dedupeHash}:${timeBucket}` with a UNIQUE index. This is what makes
     * deduplication race-safe: two concurrent identical submissions both try
     * to insert the same key and MongoDB rejects the second with E11000.
     * Application-level "check then insert" cannot do this.
     *
     * `sparse` matters for migration: rows written by the previous version
     * have no `dedupeKey`, and a plain unique index would refuse to build
     * against more than one such row. Sparse simply skips them.
     */
    dedupeKey: { type: String, required: true, unique: true, sparse: true },

    // Diagnostics. IP is stored salted-hashed, never raw.
    requestId: { type: String },
    ipHash: { type: String },
    userAgent: { type: String, maxlength: 512 },
  },
  { timestamps: true }
);

// Duplicate lookup: newest identical submission first.
contactSchema.index({ dedupeHash: 1, createdAt: -1 });
// Operational query: "what failed to deliver and needs attention?"
contactSchema.index({ "delivery.status": 1, createdAt: -1 });

export default mongoose.model("Contact", contactSchema);
