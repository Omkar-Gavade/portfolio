/**
 * Health endpoints.
 *
 * `/healthz` is liveness — cheap, always 200 if the process is up. This is
 * what Render's health check should point at; a readiness-style check there
 * would make Render restart the instance whenever Atlas hiccups.
 *
 * `/readyz` is readiness — reports dependency state and returns 503 when the
 * database is not usable. Use it for monitoring and manual triage.
 */
import asyncHandler from "../utils/asyncHandler.js";
import { isDbHealthy } from "../config/db.js";
import env from "../config/env.js";

export const live = (req, res) =>
  res.status(200).json({ status: "ok", uptime: Math.round(process.uptime()) });

export const ready = asyncHandler(async (req, res) => {
  const db = isDbHealthy();
  const status = db ? 200 : 503;

  return res.status(status).json({
    status: db ? "ok" : "degraded",
    checks: { database: db ? "up" : "down", mailProvider: env.MAIL_PROVIDER },
    uptime: Math.round(process.uptime()),
  });
});

export default { live, ready };
