/**
 * Structured logging.
 *
 * Render captures stdout and indexes it, so JSON lines are directly
 * searchable there ("provider":"resend" AND "level":50). Pretty printing is
 * only enabled outside production, where a human is reading the terminal.
 *
 * Secrets are redacted centrally so no call site has to remember.
 */
import pino from "pino";
import env from "../config/env.js";

const redact = {
  paths: [
    "req.headers.authorization",
    "req.headers.cookie",
    "*.RESEND_API_KEY",
    "*.SMTP_PASS",
    "*.apiKey",
    "*.password",
  ],
  censor: "[redacted]",
};

export const logger = pino({
  level: env.LOG_LEVEL,
  redact,
  base: { service: "portfolio-backend", env: env.NODE_ENV },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Pretty printing runs in a worker thread. Skipping it in production keeps
  // logs machine-parseable for Render, and skipping it under test stops the
  // worker from holding the test runner open after the last assertion.
  ...(env.isProduction || env.isTest || env.LOG_LEVEL === "silent"
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname,service,env" },
        },
      }),
});

export default logger;
