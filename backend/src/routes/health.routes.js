import express from "express";
import { live, ready } from "../controllers/health.controller.js";

const router = express.Router();

router.get("/healthz", live);
router.get("/readyz", ready);

// Kept for backward compatibility with anything already pinging /test.
router.get("/test", (req, res) => res.json({ ok: true }));

export default router;
