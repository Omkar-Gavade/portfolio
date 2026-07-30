import express from "express";
import { contactLimiter } from "../middleware/rateLimiters.js";
import { validateBody } from "../middleware/validate.js";
import { createContactSchema } from "../validators/contact.validator.js";
import { createContact } from "../controllers/contact.controller.js";

const router = express.Router();

// Pipeline reads top-to-bottom: throttle, validate, handle.
router.post("/", contactLimiter, validateBody(createContactSchema), createContact);

export default router;
