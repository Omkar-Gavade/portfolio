import { test } from "node:test";
import assert from "node:assert/strict";
import { createContactSchema } from "../src/validators/contact.validator.js";

test("accepts a valid submission and normalises it", () => {
  const result = createContactSchema.safeParse({
    name: "  Omkar Gavade  ",
    email: "  OMKAR@Example.COM ",
    message: "  Hello, I would like to discuss a role.  ",
  });

  assert.equal(result.success, true);
  assert.equal(result.data.name, "Omkar Gavade");
  assert.equal(result.data.email, "omkar@example.com");
  assert.equal(result.data.message, "Hello, I would like to discuss a role.");
});

test("strips unknown keys so a client cannot inject fields", () => {
  const result = createContactSchema.safeParse({
    name: "Omkar",
    email: "a@b.com",
    message: "This is a long enough message.",
    isAdmin: true,
    delivery: { status: "sent" },
  });

  assert.equal(result.success, true);
  assert.equal("isAdmin" in result.data, false);
  assert.equal("delivery" in result.data, false);
});

test("rejects missing fields with a field-specific message", () => {
  const result = createContactSchema.safeParse({ name: "Omkar" });
  assert.equal(result.success, false);
  const paths = result.error.issues.map((i) => i.path[0]);
  assert.ok(paths.includes("email"));
  assert.ok(paths.includes("message"));
});

test("rejects malformed email", () => {
  for (const email of ["notanemail", "a@b", "a b@c.com", "@b.com"]) {
    const result = createContactSchema.safeParse({
      name: "Omkar",
      email,
      message: "This is a long enough message.",
    });
    assert.equal(result.success, false, `expected ${email} to be rejected`);
  }
});

test("rejects CRLF in name and email (header injection)", () => {
  const result = createContactSchema.safeParse({
    name: "Omkar\r\nBcc: victim@example.com",
    email: "a@b.com",
    message: "This is a long enough message.",
  });
  assert.equal(result.success, false);
});

test("enforces length bounds", () => {
  const tooLong = createContactSchema.safeParse({
    name: "Omkar",
    email: "a@b.com",
    message: "x".repeat(4001),
  });
  assert.equal(tooLong.success, false);

  const tooShort = createContactSchema.safeParse({
    name: "O",
    email: "a@b.com",
    message: "short",
  });
  assert.equal(tooShort.success, false);
});
