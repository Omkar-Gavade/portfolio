# API Reference

[← Index](./README.md) · [Backend internals](./backend.md)

Base URL — local `http://localhost:8080`, production
`https://portfolio-backend-5s1x.onrender.com` (set in
`frontend/src/config/api.js`).

No authentication. CORS is restricted to `ALLOWED_ORIGINS`; requests with no
`Origin` header (curl, health checks) are allowed. JSON bodies are capped at
16 kb. Every response carries an `X-Request-Id`.

---

## `POST /api/contact`

Submit the contact form. Returns success **only after** a mail provider has
accepted the message.

**Body**

| Field | Type | Rules |
|---|---|---|
| `name` | string | 2–120 chars, single line, no control characters |
| `email` | string | valid address, ≤200 chars, lowercased |
| `message` | string | 10–4000 chars, no control characters |
| `website` | string | Honeypot — omit. If present and non-empty the request is silently discarded with a fake success |

Unknown keys are stripped. Single-line and control-character rules exist
because these values are interpolated into an email — CR/LF is a header
injection vector.

```bash
curl -X POST http://localhost:8080/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","message":"Hello, let us talk."}'
```

**Responses**

| Status | Meaning |
|---|---|
| `201` | Created and delivered |
| `200` | Idempotent replay — identical submission already delivered inside the dedupe window |
| `400` | Validation failed, or malformed JSON |
| `409` | Identical submission currently being processed concurrently |
| `429` | Rate limit — 5 per 10 minutes per IP by default |
| `502` | Saved, but the notification could not be delivered (`MAIL_DELIVERY_FAILED`) |
| `503` | Database unreachable (`DB_UNAVAILABLE`) |

```jsonc
// 201
{ "success": true, "message": "Message sent successfully", "id": "...", "duplicate": false }

// error
{ "success": false, "message": "...", "code": "MAIL_DELIVERY_FAILED", "requestId": "..." }
```

`502` means the message **is stored** — it is not lost, only undelivered. The
frontend surfaces this as "email me directly".

---

## `GET /healthz` — liveness

Always `200` while the process is up. This is what Render's health check points
at; pointing it at `/readyz` would restart the instance on any brief Atlas
hiccup.

```json
{ "status": "ok", "uptime": 1234 }
```

## `GET /readyz` — readiness

`200` when the database is usable, `503` when not. For monitoring and triage.

```json
{ "status": "ok", "checks": { "database": "up", "mailProvider": "resend" }, "uptime": 1234 }
```

## `GET /test`

Returns `{ "ok": true }`. Kept only for backward compatibility.

---

## Third-party APIs used by the frontend

Called directly from the browser, unauthenticated, cached in `sessionStorage`
for one hour. Both fail silently — the block hides rather than showing an error.

| Endpoint | Purpose |
|---|---|
| `api.github.com/users/{user}/repos?sort=updated&per_page=100` | Repository cards |
| `github-contributions-api.jogruber.de/v4/{user}?y=last` | Contribution heatmap |

The contributions endpoint is a free third-party service, not GitHub. If it
disappears, the heatmap hides and nothing else breaks.
