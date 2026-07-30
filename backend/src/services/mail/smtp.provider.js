/**
 * SMTP provider (Nodemailer) — kept only as an explicit, opt-in fallback.
 *
 * `nodemailer` is imported lazily so the dependency is never loaded, and the
 * module never has to resolve, unless SMTP is actually configured. That is a
 * direct fix for the original bug: `nodemailer` was imported at module scope
 * while being absent from `package.json`, so any clean install produced
 * ERR_MODULE_NOT_FOUND at boot and took the entire API down with it.
 *
 * Every timeout below is explicit. Nodemailer's defaults let a blocked
 * outbound port hang until the OS TCP timeout — minutes — which is precisely
 * how "returns success, email never arrives" happens on a PaaS.
 */
import env from "../../config/env.js";
import logger from "../../utils/logger.js";
import MailError, { isTransientNetworkError } from "./MailError.js";

const NAME = "smtp";

let transporterPromise = null;

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      const { default: nodemailer } = await import("nodemailer");
      return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        connectionTimeout: env.MAIL_TIMEOUT_MS,
        greetingTimeout: env.MAIL_TIMEOUT_MS,
        socketTimeout: env.MAIL_TIMEOUT_MS,
        // Reuse one connection instead of a TLS handshake per message.
        pool: true,
        maxConnections: 2,
        maxMessages: 50,
      });
    })().catch((error) => {
      transporterPromise = null; // allow a later retry to rebuild it
      throw error;
    });
  }
  return transporterPromise;
}

/** 4xx SMTP replies are "try later"; 5xx are permanent rejections. */
const isRetryableSmtpCode = (code) => typeof code === "number" && code >= 400 && code < 500;

export const smtpProvider = {
  name: NAME,

  isConfigured: () => Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),

  async send({ subject, text, html, replyTo }) {
    try {
      const transporter = await getTransporter();
      const info = await transporter.sendMail({
        from: env.MAIL_FROM,
        to: env.MAIL_TO,
        replyTo,
        subject,
        text,
        html,
      });

      // A message can be accepted by the server yet rejected for every
      // recipient. That is not a success.
      if (Array.isArray(info?.rejected) && info.rejected.length > 0) {
        throw new MailError(`SMTP rejected recipients: ${info.rejected.join(", ")}`, {
          provider: NAME,
          retryable: false,
          providerCode: info?.response,
        });
      }

      return { provider: NAME, messageId: info?.messageId ?? "smtp-unknown" };
    } catch (error) {
      if (error instanceof MailError) throw error;

      if (error?.code === "ERR_MODULE_NOT_FOUND") {
        logger.error("smtp: nodemailer is not installed — run `npm i nodemailer`");
        throw new MailError("SMTP fallback unavailable: nodemailer not installed", {
          provider: NAME,
          retryable: false,
          cause: error,
        });
      }

      throw new MailError(`SMTP send failed: ${error?.message ?? error}`, {
        provider: NAME,
        retryable: isTransientNetworkError(error) || isRetryableSmtpCode(error?.responseCode),
        providerCode: error?.code ?? error?.responseCode,
        cause: error,
      });
    }
  },

  async verify() {
    try {
      const transporter = await getTransporter();
      await transporter.verify();
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error?.message ?? String(error) };
    }
  },

  async close() {
    if (!transporterPromise) return;
    try {
      const transporter = await transporterPromise;
      transporter.close?.();
    } catch {
      /* nothing useful to do while shutting down */
    }
  },
};

export default smtpProvider;
