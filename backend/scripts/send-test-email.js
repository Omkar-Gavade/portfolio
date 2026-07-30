/**
 * Mail smoke test — proves credentials, sender domain and network path work,
 * without touching the database or starting the server.
 *
 *   npm run mail:smoke
 *
 * Run it locally after configuring `.env`, and run it once against production
 * config (Render shell) after the first deploy.
 */
import env from "../src/config/env.js";
import logger from "../src/utils/logger.js";
import { sendContactNotification, verifyMailProviders } from "../src/services/mail/mail.service.js";

const run = async () => {
  logger.info({ provider: env.MAIL_PROVIDER, from: env.MAIL_FROM, to: env.MAIL_TO }, "smoke: config");

  const verification = await verifyMailProviders();
  if (!verification.some((entry) => entry.ok)) {
    logger.fatal({ verification }, "smoke: no provider passed verification");
    process.exit(1);
  }

  const result = await sendContactNotification({
    name: "Smoke Test",
    email: "smoke-test@example.com",
    message: "Automated deliverability check. If you can read this, mail works.",
    submittedAt: new Date(),
    contactId: `smoke-${Date.now()}`,
  });

  logger.info(result, "smoke: delivered");
  process.exit(0);
};

run().catch((error) => {
  logger.fatal(
    { err: error?.message, provider: error?.provider, statusCode: error?.statusCode },
    "smoke: FAILED"
  );
  process.exit(1);
});
