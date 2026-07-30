/**
 * HTTP-level tests that never touch MongoDB or a mail provider.
 *
 * Validation and routing failures are answered before the service layer runs,
 * so `app` can be exercised with supertest against a config that points at a
 * database it never dials.
 */
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/unused";
process.env.MAIL_PROVIDER = "resend";
process.env.RESEND_API_KEY = "re_test_key";
process.env.MAIL_FROM = "Portfolio <contact@example.com>";
process.env.MAIL_TO = "owner@example.com";
process.env.ALLOWED_ORIGINS = "https://portfolio.example.com";
process.env.IP_HASH_SALT = "test-salt-value";
process.env.LOG_LEVEL = "silent";

const { test } = await import("node:test");
const assert = (await import("node:assert/strict")).default;
const request = (await import("supertest")).default;
const app = (await import("../src/app.js")).default;

test("GET /healthz reports liveness", async () => {
  const response = await request(app).get("/healthz");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("unknown routes return 404 in the standard envelope", async () => {
  const response = await request(app).get("/does-not-exist");
  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.code, "NOT_FOUND");
});

test("every response carries a request id", async () => {
  const response = await request(app).get("/healthz");
  assert.ok(response.headers["x-request-id"]);
});

test("invalid payload is rejected with 400 before any I/O", async () => {
  const response = await request(app)
    .post("/api/contact")
    .send({ name: "O", email: "nope", message: "short" });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.code, "VALIDATION_ERROR");
});

test("malformed JSON is a 400, not a 500", async () => {
  const response = await request(app)
    .post("/api/contact")
    .set("Content-Type", "application/json")
    .send("{ broken");

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("honeypot submissions look successful but do nothing", async () => {
  const response = await request(app).post("/api/contact").send({
    name: "Spam Bot",
    email: "bot@example.com",
    message: "Buy cheap backlinks from our premium network today.",
    website: "http://spam.example.com",
  });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
});

test("disallowed origins are rejected by CORS", async () => {
  const response = await request(app)
    .post("/api/contact")
    .set("Origin", "https://evil.example.com")
    .send({ name: "Omkar", email: "a@b.com", message: "A long enough message here." });

  assert.equal(response.status, 403);
});
