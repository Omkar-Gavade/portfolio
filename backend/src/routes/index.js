/**
 * Route registry. One place to see every path the API exposes; `app.js` no
 * longer grows a new `app.use` line per feature.
 */
import express from "express";
import healthRoutes from "./health.routes.js";
import contactRoutes from "./contact.routes.js";

const router = express.Router();

router.use("/", healthRoutes);
router.use("/api/contact", contactRoutes);

export default router;
