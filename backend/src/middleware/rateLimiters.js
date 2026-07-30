/**
 * Abuse controls.
 *
 * Caveat worth knowing: this is an in-memory store. It resets on every Render
 * deploy/restart and is per-instance, so it is a speed bump, not a hard quota.
 * For a portfolio that is the right trade (no Redis to run or pay for) — the
 * duplicate-submission guard in the service layer is the durable, correct
 * protection, and this only exists to blunt volumetric spam.
 */
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";

export const contactLimiter = rateLimit({
  windowMs: env.CONTACT_RATE_LIMIT_WINDOW_MS,
  limit: env.CONTACT_RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // `ipKeyGenerator` normalises IPv6 into a /64 subnet, so a single client
  // cannot trivially rotate through its address range.
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: (req, res, next) =>
    next(
      AppError.tooManyRequests(
        "Too many messages sent. Please try again in a little while."
      )
    ),
});

/** Coarse guard for everything else, so a scraper cannot hammer the instance. */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: (req, res, next) => next(AppError.tooManyRequests("Too many requests.")),
});

export default { contactLimiter, globalLimiter };
