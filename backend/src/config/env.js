/**
 * Single source of truth for configuration.
 *
 * This module MUST be the first thing imported by any module that reads
 * configuration. Importing it runs `dotenv` as a side effect *before* this
 * module's body executes, and every other module reads the frozen `env`
 * object instead of `process.env` — which removes the ESM ordering trap where
 * a top-level `process.env.X` read happens before `dotenv.config()` has run.
 *
 * Invalid or missing configuration crashes the process at boot with a readable
 * report. Fail loudly at deploy time, never silently at 2am on a real message.
 */
import "dotenv/config";
import { z } from "zod";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Display Name <a@b.com>" or bare "a@b.com"
const MAIL_ADDRESS_RE = /^(?:[^<>]*<\s*[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+\s*>|[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/;

const csv = (value) =>
  String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(8080),
    LOG_LEVEL: z
      .enum(["silent", "fatal", "error", "warn", "info", "debug", "trace"])
      .default("info"),

    MONGO_URI: z.string().min(1, "MONGO_URI is required"),
    MONGO_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
    MONGO_SOCKET_TIMEOUT_MS: z.coerce.number().int().positive().default(20_000),

    ALLOWED_ORIGINS: z.string().default(""),

    // --- Mail ---------------------------------------------------------------
    // `resend` is the primary provider. `smtp` exists only as an explicit
    // escape hatch / fallback and is never required to be configured.
    MAIL_PROVIDER: z.enum(["resend", "smtp"]).default("resend"),
    MAIL_FALLBACK_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),

    MAIL_FROM: z.string().regex(MAIL_ADDRESS_RE, "MAIL_FROM must be an email or 'Name <email>'"),
    MAIL_TO: z.string().regex(EMAIL_RE, "MAIL_TO must be a valid email"),

    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_BASE_URL: z.string().url().default("https://api.resend.com"),

    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),

    // Per-attempt network timeout. Kept well under any sane proxy/browser
    // timeout so we always control the failure, rather than the client
    // giving up on a socket we are still holding open.
    MAIL_TIMEOUT_MS: z.coerce.number().int().positive().default(8_000),
    // Total wall-clock budget across all attempts, including backoff.
    MAIL_TOTAL_BUDGET_MS: z.coerce.number().int().positive().default(20_000),
    MAIL_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(6).default(3),
    MAIL_RETRY_BASE_DELAY_MS: z.coerce.number().int().positive().default(400),

    // --- Abuse / duplicate control -----------------------------------------
    CONTACT_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(10 * 60 * 1000),
    CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
    // Identical (email + message) inside this window is treated as the same
    // submission rather than a new one.
    CONTACT_DEDUPE_WINDOW_MS: z.coerce.number().int().positive().default(5 * 60 * 1000),

    // Salt for hashing client IPs before storage. Storing a raw IP is
    // personal data we do not need; a salted hash still supports abuse triage.
    IP_HASH_SALT: z.string().min(8).default("change-me-in-production"),
  })
  .superRefine((cfg, ctx) => {
    const needsResend = cfg.MAIL_PROVIDER === "resend" || cfg.MAIL_FALLBACK_ENABLED;
    if (needsResend && cfg.MAIL_PROVIDER === "resend" && !cfg.RESEND_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["RESEND_API_KEY"],
        message: "RESEND_API_KEY is required when MAIL_PROVIDER=resend",
      });
    }

    const smtpNeeded =
      cfg.MAIL_PROVIDER === "smtp" ||
      (cfg.MAIL_FALLBACK_ENABLED && cfg.MAIL_PROVIDER === "resend");

    if (smtpNeeded) {
      for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]) {
        if (!cfg[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when SMTP is used as provider or fallback`,
          });
        }
      }
    }

    if (cfg.NODE_ENV === "production") {
      if (csv(cfg.ALLOWED_ORIGINS).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ALLOWED_ORIGINS"],
          message: "ALLOWED_ORIGINS must be set in production (no wildcard fallback)",
        });
      }
      if (cfg.IP_HASH_SALT === "change-me-in-production") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["IP_HASH_SALT"],
          message: "IP_HASH_SALT must be set to a real secret in production",
        });
      }
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const report = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  // No logger here on purpose: the logger itself depends on this module.
  console.error(`Invalid environment configuration:\n${report}`);
  process.exit(1);
}

export const env = Object.freeze({
  ...parsed.data,
  allowedOrigins: csv(parsed.data.ALLOWED_ORIGINS),
  isProduction: parsed.data.NODE_ENV === "production",
  isTest: parsed.data.NODE_ENV === "test",
});

export default env;
