/**
 * Process lifecycle: connect dependencies, start listening, shut down cleanly.
 *
 * Fixes relative to the previous version:
 *  - A failed DB connection now exits non-zero. Previously the error was
 *    logged and the process stayed alive without a listener, so Render saw a
 *    "running" service that answered nothing.
 *  - Mail credentials are verified at boot, so a bad/rotated API key is found
 *    at deploy time rather than by a message that never arrives.
 *  - SIGTERM is handled. Render sends SIGTERM on every deploy; without a
 *    handler, in-flight sends are killed mid-request. We stop accepting new
 *    connections, let open requests finish, then close the DB.
 *  - `unhandledRejection` / `uncaughtException` are fatal-by-design: an
 *    unknown-state process is restarted rather than left to serve corrupt
 *    behaviour.
 */
import env from "./config/env.js";
import app from "./app.js";
import logger from "./utils/logger.js";
import connectDB, { disconnectDB } from "./config/db.js";
import { verifyMailProviders, closeMailProviders } from "./services/mail/mail.service.js";

const SHUTDOWN_TIMEOUT_MS = 15_000;

let server;
let shuttingDown = false;

async function start() {
  await connectDB();

  // Non-fatal: a provider outage should not block a deploy, but it must be
  // loud. Fire and log; do not await forever.
  verifyMailProviders().catch((error) =>
    logger.error({ err: error }, "mail: verification threw unexpectedly")
  );

  server = app.listen(env.PORT, () =>
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "server listening")
  );

  // Slightly above typical proxy keep-alive to avoid races on idle sockets.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 70_000;
}

// async function start() {
//   console.log("STEP 1: start()");
//   console.log("STEP 2: connecting to MongoDB...");

//   await connectDB();

//   console.log("STEP 3: MongoDB connected");

//   verifyMailProviders().catch((error) =>
//     logger.error({ err: error }, "mail: verification threw unexpectedly")
//   );

//   console.log("STEP 4: starting Express");

//   server = app.listen(env.PORT, () => {
//     console.log(`STEP 5: Server listening on ${env.PORT}`);
//     logger.info({ port: env.PORT, env: env.NODE_ENV }, "server listening");
//   });
// }

async function shutdown(signal, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "shutdown: draining");

  const force = setTimeout(() => {
    logger.error("shutdown: drain timed out, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  force.unref();

  try {
    if (server) await new Promise((resolve) => server.close(resolve));
    await closeMailProviders();
    await disconnectDB();
    logger.info("shutdown: complete");
  } catch (error) {
    logger.error({ err: error }, "shutdown: error while draining");
    exitCode = exitCode || 1;
  } finally {
    clearTimeout(force);
    process.exit(exitCode);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "unhandled promise rejection");
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "uncaught exception");
  shutdown("uncaughtException", 1);
});

start().catch((error) => {
  logger.fatal({ err: error }, "startup failed");
  process.exit(1);
});
