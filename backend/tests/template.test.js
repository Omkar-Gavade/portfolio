import { test } from "node:test";
import assert from "node:assert/strict";
import contactNotification from "../src/services/mail/templates/contactNotification.js";

test("includes sender details and sets replyTo", () => {
  const mail = contactNotification({
    name: "Omkar",
    email: "omkar@example.com",
    message: "Hello there",
    submittedAt: new Date("2026-01-01T00:00:00Z"),
    contactId: "abc123",
  });

  assert.match(mail.subject, /Omkar/);
  assert.match(mail.text, /omkar@example\.com/);
  assert.match(mail.text, /Hello there/);
  assert.equal(mail.replyTo, "omkar@example.com");
});

test("escapes HTML so a message cannot inject markup", () => {
  const mail = contactNotification({
    name: "Omkar",
    email: "omkar@example.com",
    message: '<img src=x onerror="alert(1)">',
    contactId: "abc123",
  });

  assert.equal(mail.html.includes("<img src=x"), false);
  assert.match(mail.html, /&lt;img/);
});

test("collapses CRLF in header-bound values", () => {
  const mail = contactNotification({
    name: "Omkar\r\nBcc: victim@example.com",
    email: "omkar@example.com\r\nBcc: victim@example.com",
    message: "hello",
  });

  assert.equal(/[\r\n]/.test(mail.subject), false);
  assert.equal(/[\r\n]/.test(mail.replyTo), false);
});
