/**
 * Express application wiring only — no server, no database, no side effects.
 *
 * Keeping `app` free of `listen()` and `connect()` is what makes it importable
 * from a test file (supertest) without opening a port or touching Atlas.
 * `server.js` owns the process lifecycle.
 *
 * Note the first import: `env` is imported before anything reads
 * configuration. In the previous version `app.js` read
 * `process.env.ALLOWED_ORIGINS` at module scope while `dotenv.config()` ran
 * later in `server.js` — ESM evaluates imported modules first, so the CORS
 * allowlist was always empty locally and silently fell through to "allow all".
 */
import env from "./config/env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import routes from "./routes/index.js";
import requestContext from "./middleware/requestContext.js";
import { globalLimiter } from "./middleware/rateLimiters.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";

const app = express();

// Render terminates TLS at its proxy; without this `req.ip` is the proxy's
// address and every visitor shares one rate-limit bucket.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(requestContext);

const corsOptions = {
  origin(origin, callback) {
    // No Origin header: curl, server-to-server, health checks.
    if (!origin) return callback(null, true);
    if (env.allowedOrigins.includes(origin)) return callback(null, true);
    // Dev convenience only. `env.js` refuses to boot in production with an
    // empty allowlist, so this branch cannot leak into prod.
    if (!env.isProduction && env.allowedOrigins.length === 0) return callback(null, true);
    return callback(new AppError(403, "Origin not allowed by CORS", { code: "CORS_REJECTED" }));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Request-Id"],
  exposedHeaders: ["X-Request-Id", "RateLimit"],
  maxAge: 86_400,
};

// `cors()` answers preflight OPTIONS itself, so no separate app.options route.
app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(globalLimiter);

app.use(routes);

app.use(notFound);
app.use(errorHandler);

export default app;
