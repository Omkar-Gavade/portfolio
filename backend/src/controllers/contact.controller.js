/**
 * Thin controller: HTTP in, HTTP out.
 *
 * No validation (middleware), no email (mail service), no persistence
 * (repository), no error formatting (error middleware). What remains is the
 * honeypot short-circuit — an HTTP-layer concern — and mapping a service
 * result onto a status code.
 *
 * Response shape is unchanged from the original API, so the deployed React
 * frontend needs no modification: `{ success: boolean, message: string }`.
 * Additive fields only.
 */
import asyncHandler from "../utils/asyncHandler.js";
import { submitContact } from "../services/contact.service.js";

export const createContact = asyncHandler(async (req, res) => {
  const { website, ...payload } = req.body;

  // Honeypot: hidden field, only bots fill it. Respond exactly as we would on
  // success so the bot learns nothing, but persist and send nothing.
  if (website) {
    req.log.warn({ ip: req.ip }, "contact: honeypot triggered, discarding");
    return res.status(201).json({ success: true, message: "Message sent successfully" });
  }

  const { contact, duplicate } = await submitContact(payload, {
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    log: req.log,
  });

  // 200 for an idempotent replay (nothing new was created), 201 for a new
  // submission that was created and delivered.
  return res.status(duplicate ? 200 : 201).json({
    success: true,
    message: "Message sent successfully",
    id: contact.id,
    duplicate,
  });
});

export default { createContact };
