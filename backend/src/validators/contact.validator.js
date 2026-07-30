/**
 * Request schemas. Validation is declarative and lives outside the controller,
 * so the controller never branches on shape and the rules are testable alone.
 *
 * `.strip()` on the object drops unknown keys — a client cannot smuggle extra
 * fields into a Mongoose document through us.
 */
import { z } from "zod";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Control characters other than tab/CR/LF. They serve no purpose in a contact
// form and are a header-injection vector once interpolated into an email.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const noControlChars = (value) => !CONTROL_CHARS.test(value);
const singleLine = (value) => !/[\r\n]/.test(value);

export const createContactSchema = z
  .object({
    name: z
      .string({ required_error: "Name is required", invalid_type_error: "Name must be text" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name must be 120 characters or fewer")
      .refine(noControlChars, "Name contains invalid characters")
      // A name is one line; CR/LF here would end up in an email header.
      .refine(singleLine, "Name must be a single line"),

    email: z
      .string({ required_error: "Email is required", invalid_type_error: "Email must be text" })
      .trim()
      .toLowerCase()
      .max(200, "Email must be 200 characters or fewer")
      .regex(EMAIL_RE, "Please enter a valid email address")
      .refine(singleLine, "Email must be a single line"),

    message: z
      .string({ required_error: "Message is required", invalid_type_error: "Message must be text" })
      .trim()
      .min(1, "Message must be at least 10 characters")
      .max(4000, "Message must be 4000 characters or fewer")
      .refine(noControlChars, "Message contains invalid characters"),

    // Honeypot. Real users never see this field; bots fill everything.
    website: z.string().max(200).optional(),
  })
  .strip();

export default { createContactSchema };
