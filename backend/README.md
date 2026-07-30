# Portfolio Backend

Contact API for the portfolio site. Express 5 + MongoDB Atlas + Resend, deployed on Render.

---

## The problem this rewrite solves

The previous version returned `201 { success: true }` for submissions whose
notification email never arrived. Six separate defects contributed:

| # | Defect | Consequence |
|---|--------|-------------|
| 1 | `nodemailer` imported but **absent from `package.json` and the lockfile** | A clean `npm ci` on Render produces `ERR_MODULE_NOT_FOUND` at boot. The live instance only worked on a stale cached `node_modules`; the next clean build would have taken the whole API down, not just email. |
| 2 | Gmail SMTP from a datacentre IP | See [Why Gmail SMTP fails on Render](#why-gmail-smtp-fails-on-render). |
| 3 | No timeouts anywhere on the SMTP transport | A blocked outbound port hangs until the OS TCP timeout. The browser gives up first; the request appears to succeed or hang forever. |
| 4 | No retry, no delivery record | A transient 4xx was a permanently lost message with no trace. |
| 5 | `dotenv.config()` ran *after* `app.js` had already read `process.env` | ESM evaluates imported modules before the importer's body. The CORS allowlist was always empty locally and fell through to "allow all". |
| 6 | DB connect failure logged but not fatal | Render saw a "live" service with no listener. |

The fix is structural: **the HTTP response is now derived from the delivery
outcome**, not issued alongside it.

---

## Architecture

```
                    ┌──────────────────────────────────────┐
  React (Vercel)    │  POST /api/contact                   │
  ────────────────▶ │  { name, email, message }            │
                    └──────────────────┬───────────────────┘
                                       │
   ┌───────────────────────────────────▼─────────────────────────────────┐
   │ app.js — helmet · requestContext · CORS · json(16kb) · rateLimit     │
   └───────────────────────────────────┬─────────────────────────────────┘
                                       │
   ┌───────────────────────────────────▼─────────────────────────────────┐
   │ routes/contact  →  contactLimiter  →  validateBody(zod)             │
   └───────────────────────────────────┬─────────────────────────────────┘
                                       │  clean, typed payload
   ┌───────────────────────────────────▼─────────────────────────────────┐
   │ controllers/contact — honeypot check, status-code mapping only      │
   └───────────────────────────────────┬─────────────────────────────────┘
                                       │
   ┌───────────────────────────────────▼─────────────────────────────────┐
   │ services/contact.service                                            │
   │   1. dedupe lookup (hash + time bucket)                             │
   │   2. persist as `pending`          ──────▶ repositories/contact ──▶ MongoDB
   │   3. send (bounded + retried)      ──────▶ services/mail           │
   │   4. record `sent` | `failed`      ──────▶ repositories/contact ──▶ MongoDB
   └───────────────────────────────────┬─────────────────────────────────┘
                                       │
   ┌───────────────────────────────────▼─────────────────────────────────┐
   │ services/mail/mail.service                                          │
   │   provider chain · per-attempt timeout · budget · jittered retry    │
   │        ├── resend.provider   (HTTPS 443, AbortSignal, idempotency)  │──▶ Resend API
   │        └── smtp.provider     (opt-in fallback, lazy nodemailer)     │──▶ SMTP relay
   └───────────────────────────────────┬─────────────────────────────────┘
                                       │ throws on failure
   ┌───────────────────────────────────▼─────────────────────────────────┐
   │ middleware/errorHandler — the single response formatter             │
   │   AppError → its status   ·   DB down → 503   ·   unknown → 500     │
   └─────────────────────────────────────────────────────────────────────┘
```

**Request outcome matrix**

| Situation | Status | Body |
|-----------|--------|------|
| Saved and email accepted | `201` | `{ success: true, message: "Message sent successfully", id, duplicate: false }` |
| Identical message inside dedupe window, already delivered | `200` | `{ success: true, …, duplicate: true }` |
| Validation failure | `400` | `{ success: false, message, code: "VALIDATION_ERROR" }` |
| Concurrent identical submission still in flight | `409` | `{ success: false, code: "CONFLICT" }` |
| Rate limit exceeded | `429` | `{ success: false, code: "RATE_LIMITED" }` |
| Saved but **email could not be delivered** | `502` | `{ success: false, code: "MAIL_DELIVERY_FAILED" }` |
| Database unreachable | `503` | `{ success: false, code: "DB_UNAVAILABLE" }` |
| Unexpected bug | `500` | `{ success: false, message: "Internal server error" }` |

`success: true` now means *the notification was accepted by a mail provider
that returned a message id*. Nothing weaker qualifies.

---

## Why Gmail SMTP fails on Render

Locally you send from a residential ISP address with a clean reputation and
unrestricted outbound ports. On Render none of that holds:

1. **Outbound SMTP is restricted.** Ports 25/465/587 leaving a shared PaaS are
   the classic spam vector, so they are commonly blocked or heavily throttled.
   A blocked port does not produce a fast error — the TCP connection simply
   never completes, and without an explicit timeout Nodemailer waits minutes.
2. **Shared, poor-reputation egress IPs.** Your instance shares outbound
   addresses with every other tenant on that host. Google rates the *IP*, not
   just the account, so a neighbour's spam becomes your `421-4.7.0` throttle.
3. **Google's anti-abuse heuristics.** A login from an unfamiliar datacentre
   IP, in a new region, at machine cadence is exactly the signal Google acts
   on: App Password revoked, `535-5.7.8 Username and Password not accepted`,
   or silent quarantine of the message *after* accepting it.
4. **Gmail is a mailbox, not a sending API.** ~500 recipients/day, no
   per-message delivery status, no webhooks, no suppression list, no bounce
   handling. When a message vanishes there is nothing to inspect.
5. **A long-lived TLS connection to `smtp.gmail.com` does not survive a free
   instance sleeping.** Render suspends free instances after 15 minutes idle;
   any work in flight dies with the container, response already sent.
6. **SPF/DKIM alignment.** Sending "as" your Gmail address from a third party
   is precisely the pattern DMARC exists to stop. Even when accepted, the
   message lands in spam more often than it should.

Net effect: an intermittent, unobservable failure that only reproduces in
production — exactly what you saw.

---

## Provider comparison

| | **Gmail SMTP** | **Resend** | **SendGrid** | **Mailgun** |
|---|---|---|---|---|
| Transport | SMTP :465/:587 | HTTPS :443 | HTTPS + SMTP | HTTPS + SMTP |
| Blocked by PaaS egress rules | **Often** | No | No | No |
| Free tier | 500 recipients/day (mailbox quota) | 3,000/mo, 100/day | 100/day (trial-limited) | 100/day (trial), then paid |
| Setup effort | App Password, 5 min | API key, ~5 min; domain verify ~15 min | Sender identity + domain, more steps | Domain + DNS, most steps |
| Node integration | `nodemailer` | one `fetch` call, or thin SDK | SDK | SDK |
| Delivery visibility | **None** | Per-message log, status, webhooks | Full analytics suite | Full analytics + logs API |
| Idempotency keys | No | **Yes (24h)** | No | No |
| Bounce/complaint handling | Manual | Automatic | Automatic | Automatic |
| Deliverability on shared IP | Poor | Good | Good | Good |
| DX / API surface | N/A | Minimal, modern | Large, legacy-shaped | Powerful, ops-oriented |
| Best suited to | Personal mail | Product & transactional email, small–mid volume | Enterprise marketing + transactional | High-volume, deliverability tuning |

### Recommendation: **Resend**

For a portfolio contact form — a handful of messages a month, one recipient,
one developer maintaining it — Resend wins on every axis that matters here:

- **It removes the actual failure mode.** HTTPS on 443 is never blocked by a
  PaaS; the SMTP port problem disappears entirely rather than being worked
  around.
- **Free tier covers this use case by two orders of magnitude** (3,000/month
  vs. realistically <30).
- **Idempotency keys are unique among the four.** After an ambiguous timeout
  you can safely retry without risking a duplicate — a guarantee SendGrid and
  Mailgun do not offer, and the reason the retry logic here is provably safe.
- **Observability without a dashboard project.** Every send returns an id you
  can search in the Resend log, which is stored on the contact row.
- Smallest integration surface: ~60 lines of `fetch`, zero SDK dependency,
  full control over timeout and abort.

SendGrid and Mailgun are both excellent and would also fix the problem — they
are the right answer at higher volume or when you need marketing features,
subusers, or deliverability consulting. They are simply more machinery than
this needs. **Gmail SMTP is not a production option** for anything server-sent.

---

## Folder structure

```
backend/
├── render.yaml                     # deployment as code
├── .env.example                    # every variable, documented
├── scripts/
│   └── send-test-email.js          # `npm run mail:smoke` — proves mail without the DB
├── tests/
│   ├── api.test.js                 # HTTP contract, no DB or network
│   ├── validator.test.js
│   ├── retry.test.js
│   └── template.test.js
└── src/
    ├── server.js                   # process lifecycle: connect, listen, drain
    ├── app.js                      # express wiring only — importable by tests
    ├── config/
    │   ├── env.js                  # validated, frozen config; fails fast at boot
    │   └── db.js                   # connection + events + health probe
    ├── routes/
    │   ├── index.js                # registry
    │   ├── contact.routes.js
    │   └── health.routes.js
    ├── middleware/
    │   ├── requestContext.js       # request id + child logger + access log
    │   ├── validate.js             # generic zod body validation
    │   ├── rateLimiters.js
    │   ├── notFound.js
    │   └── errorHandler.js         # the ONLY place errors become responses
    ├── validators/
    │   └── contact.validator.js
    ├── controllers/
    │   ├── contact.controller.js   # ~20 lines
    │   └── health.controller.js
    ├── services/
    │   ├── contact.service.js      # use case: dedupe → persist → send → record
    │   └── mail/
    │       ├── mail.service.js     # provider chain, retry, budget
    │       ├── resend.provider.js
    │       ├── smtp.provider.js    # opt-in fallback, lazily imported
    │       ├── MailError.js        # normalised failure + retryability
    │       └── templates/
    │           └── contactNotification.js
    ├── repositories/
    │   └── contact.repository.js   # the only module that touches Mongoose
    ├── models/
    │   └── Contact.js
    └── utils/
        ├── logger.js
        ├── AppError.js
        ├── asyncHandler.js
        ├── retry.js
        └── withTimeout.js
```

Dependency direction is strictly inward: `routes → controllers → services →
repositories → models`. No module imports from a layer above it, so any layer
can be tested with the one below stubbed.

---

## Local setup

```bash
cd backend
cp .env.example .env      # fill MONGO_URI, RESEND_API_KEY, MAIL_FROM, MAIL_TO
npm install
npm run mail:smoke        # verifies credentials + delivery, no DB needed
npm run dev
npm test
```

---

## Deployment (Render)

1. **Verify a sending domain in Resend** (Domains → Add). Add the TXT/CNAME
   records it gives you at your DNS host. Until that resolves, set
   `MAIL_FROM="Portfolio Contact <onboarding@resend.dev>"` — the sandbox sender
   only delivers to the address that owns the Resend account, which is fine
   because `MAIL_TO` is you.
2. **Create the API key** (Resend → API Keys, `Sending access` only). Copy it
   once; it is not shown again.
3. **Set environment variables** on the Render service:
   `NODE_ENV=production`, `MONGO_URI`, `RESEND_API_KEY`, `MAIL_FROM`,
   `MAIL_TO`, `ALLOWED_ORIGINS=https://<your-vercel-domain>`, `IP_HASH_SALT`.
   Remove the now-unused `EMAIL_USER` / `EMAIL_PASS`.
4. **Build command** `npm ci`, **start command** `npm start`, **root
   directory** `backend`. Clear the build cache on the first deploy so the
   stale `node_modules` that was masking the missing dependency is discarded.
5. **Health check path** `/healthz`.
6. **MongoDB Atlas → Network Access**: Render egress IPs are dynamic, so allow
   `0.0.0.0/0` and rely on the connection-string credentials, or pin Render's
   static outbound IPs if your plan provides them.
7. **Deploy, then read the logs.** You should see `mongo: connected`,
   `mail: provider verified`, `server listening`. `mail: provider
   verification FAILED` means the key or domain is wrong — fix before testing.
8. **Free plan caveat**: instances sleep after 15 minutes idle, so the first
   submission after a quiet period waits ~30–50s for a cold start. The request
   still completes correctly. Upgrade to Starter, or ping `/healthz` on a
   schedule, if that latency matters.

---

## Migrating existing data

Rows written by the previous version have no `dedupeHash`, `dedupeKey` or
`delivery` sub-document. Nothing breaks — the unique index on `dedupeKey` is
`sparse`, so it simply ignores them, and reads tolerate the missing fields.

If you want the old rows to show up in the "undelivered" query, backfill them
once. They predate delivery tracking, so mark them `sent`:

```js
db.contacts.updateMany(
  { delivery: { $exists: false } },
  { $set: { "delivery.status": "sent", "delivery.provider": "legacy-smtp", "delivery.attempts": 1 } }
)
```

---

## Operations

Find submissions whose notification never went out:

```js
db.contacts.find({ "delivery.status": { $in: ["pending", "failed"] } })
           .sort({ createdAt: -1 })
```

Every log line for one submission shares a `requestId`, echoed to the client
as the `X-Request-Id` header — search that value in Render's log stream to see
the full lifecycle of a report.
