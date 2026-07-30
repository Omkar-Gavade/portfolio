/**
 * MongoDB connection lifecycle.
 *
 * Changes vs. the previous version:
 *  - Explicit `serverSelectionTimeoutMS`: without it a bad Atlas IP allowlist
 *    makes every query hang for 30s instead of failing fast.
 *  - `bufferCommands: false`: Mongoose otherwise queues queries while
 *    disconnected and resolves them minutes later — the request has long since
 *    been answered by then. We would rather error immediately and say so.
 *  - Connection events are logged, so a mid-life disconnect is visible in
 *    Render logs instead of silently degrading.
 *  - No `process.exit` buried in a helper; the caller decides how to fail.
 */
import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

export async function connectDB() {
  mongoose.connection.on("connected", () => logger.info("mongo: connected"));
  mongoose.connection.on("disconnected", () => logger.warn("mongo: disconnected"));
  mongoose.connection.on("reconnected", () => logger.info("mongo: reconnected"));
  mongoose.connection.on("error", (err) =>
    logger.error({ err }, "mongo: connection error")
  );

  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
    socketTimeoutMS: env.MONGO_SOCKET_TIMEOUT_MS,
    // Render instances are small and each one holds its own pool.
    maxPoolSize: 10,
    minPoolSize: 0,
    retryWrites: true,
  });

  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.connection.close(false);
}

/** 1 === connected. Used by the health endpoint. */
export const isDbHealthy = () => mongoose.connection.readyState === 1;

export default connectDB;
