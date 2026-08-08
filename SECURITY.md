# CoachOS — Technical Roadmap & Threat Model

A note on method before the lists: a real security review isn't 20 red
flags — it's a complete pass where some findings are genuinely open and
others are "considered this attack class, here's why it doesn't apply."
Padding a list to a round number with fabricated severity would be
actively misleading. So below, items are honestly marked **OPEN**,
**MITIGATED** (with the mechanism explained), **ARCHITECTURAL**
(a property of the design, not a bug — can't be "fixed" with a patch),
or **RESOLVED** (fixed in the codebase with implementation details).

---

## Part 1 — 20 updates, framed by the CS concept underneath them

Each of these is a real algorithm/systems-theory problem, not just a
feature request.

1. **Risk scoring as supervised learning, not a heuristic sum.** The
   current `computeRiskScore` (Phase 9) is a hand-weighted linear
   combination of three signals — essentially a perceptron with
   manually-set weights instead of learned ones. Once there's enough
   historical outcome data (which students actually left), this becomes
   a genuine binary classification problem: logistic regression or a
   gradient-boosted tree over (score trend, attendance trend, fee
   status, tenure, batch size...) trained against the label
   "did not renew next term."

2. **Timetable conflict detection = interval scheduling.** A tutor
   double-booked across two batches is exactly the classic *interval
   overlap* problem. A sweep-line algorithm (sort all (start, end) pairs,
   scan once) detects every conflict in O(n log n) instead of the naive
   O(n²) pairwise check.

3. **Idempotency keys for payment/enrollment retries.** ~~Right now, if a
   client retries `/api/billing/create-order` after a timeout, it can
   create a duplicate Razorpay order.~~ **RESOLVED**: The create-order
   route now checks for an existing pending order via
   `src/lib/payment-orders.ts` before creating a new one. A retry within
   30 minutes returns the cached order instead of creating a duplicate.

4. **Token-bucket rate limiting on public endpoints.** ~~`/api/lead` has
   no rate limit.~~ **RESOLVED**: `/api/lead` now uses the sliding-window
   rate limiter (`checkLeadRate` + `getClientIP`) with a 3-per-minute
   limit per IP address, returning 429 with `Retry-After` header.

5. **Outbox pattern for notification delivery.** `notify()` currently
   does the external API call and the audit-log write in the same
   request — if the process crashes between "Twilio call succeeded" and
   "audit row written," the record is lost. The outbox pattern writes
   the *intent* to send in the same transaction as the triggering event,
   then a separate worker delivers it — solving the classic **dual-write
   problem**.

6. **Materialized aggregates for the admin dashboard.** Every dashboard
   load currently recomputes fee sums and risk tiers by scanning all
   students/fees. Fine at demo scale; at a few thousand students, this
   becomes a materialized view refreshed on write.

7. **Full-text search over the resource library** via Postgres
   `tsvector` + a GIN index, instead of client-side substring filtering.

8. **Real-time dashboard updates via Postgres LISTEN/NOTIFY** (which
   Supabase Realtime wraps) — a publish-subscribe pattern so the admin
   dashboard updates when a lead arrives, without polling.

9. **Statistical anomaly detection for scores**, replacing (or
   augmenting) the fixed "3 consecutive drops" rule with a z-score
   against the student's own historical mean/variance.

10. **A real policy engine (RBAC/ABAC) instead of scattered checks.**
    Access rules currently live in three places per route: the API
    handler's `if (role !== ...)`, the middleware, and occasionally a
    component.

11. **Connection pooling for serverless + Postgres.** Every serverless
    function invocation can open a new Postgres connection; at real
    traffic this exhausts Postgres's connection limit fast.

12. **Circuit breakers around Razorpay/Twilio/Resend.** If Twilio is
    down, `notify()` currently just fails per-call with no backoff.

13. **Exponential backoff + dead-letter queue for failed sends**,
    instead of "logged once, never retried."

14. **CQRS-lite: separate read models from write models** as scale
    grows.

15. **Content-addressable storage for uploaded materials** (hash-based
    filenames).

16. **Feature flags as a first-class table**, not env vars.

17. **Versioned, reversible migrations** via migration tooling instead
    of manually pasted SQL files.

18. **Property-based testing for the risk/dip algorithms.** Current
    tests are example-based (specific score sequences). Property-based
    testing (e.g., `fast-check`) generates thousands of random sequences
    and asserts invariants.

19. **Admin action audit log** (who changed what, when). **RESOLVED**:
    `src/lib/audit.ts` logs mutations to `data/audit-log.json`. Wired
    into enroll, score recording, attendance marking, and resource upload
    routes.

20. **Formal edge-case enumeration for the alert rules** — e.g., a
    truth table over (score trend: up/down/flat) × (attendance:
    high/low) × (fees: paid/overdue) to verify every combination
    produces the intended tier.

---

## Part 2 — Security review (20 items, honestly categorized)

### RESOLVED — fixed in this pass

1. **TOCTOU race in enrollment's email check.** ~~`emailExists()` then
   `createUser()` are two separate calls.~~ **FIX**: Removed the
   pre-flight `getUserByEmail` check. `enrollStudent` now uses
   `appendToCollectionUnique()` which checks uniqueness *inside* the
   file lock — turning a check-then-act race into an atomic constraint
   violation. See `src/lib/db.ts` (DuplicateError) and
   `src/lib/enrollment.ts`.

4. **No rate limiting on `/api/lead`.** ~~Cheap for an attacker to
   spam.~~ **FIX**: `src/app/api/lead/route.ts` now calls
   `checkLeadRate(getClientIP(request))` at the top of the handler.
   Returns 429 with `Retry-After` header when exceeded (3/min/IP).

6. **Insecure PRNG for temp passwords.** ~~`Math.random()` is not
   cryptographically secure.~~ **FIX**: `generateTempPassword()` now
   uses `crypto.randomBytes(6).toString('base64url')`. ID generation
   (`parentId`, `studentId`) now uses `crypto.randomUUID()`. See
   `src/lib/enrollment.ts`.

7. **Missing security headers.** ~~No CSP, X-Frame-Options, or
   HSTS.~~ **FIX**: `next.config.ts` now sets:
   - `Strict-Transport-Security` (2 years, includeSubDomains, preload)
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` (camera, mic, geolocation, topics all denied)
   - `Content-Security-Policy` (locked to self + Razorpay + Google Fonts)
   - `X-DNS-Prefetch-Control: on`

8. **No admin action audit log.** **FIX**: `src/lib/audit.ts` writes
   mutation events to `data/audit-log.json`. Wired into:
   - `POST /api/admin/enroll`
   - `POST /api/students/[id]/scores`
   - `POST /api/students/[id]/attendance`
   - `POST /api/resources`

9. **No existing-pending-order check before creating a Razorpay order.**
   **FIX**: `src/lib/payment-orders.ts` tracks pending orders in memory.
   `POST /api/billing/create-order` checks for an existing pending order
   before calling Razorpay, returning the cached order on retry.

### OPEN — real, known, accepted for now

2. **Confused-deputy risk from the service-role client.** Architectural
   cost of needing privileged operations at all. Mitigation is
   discipline: keep admin-client call sites small and auditable.

3. **Email-enumeration oracle.** The enroll route's `409` on a duplicate
   email confirms an account exists. This endpoint is admin-only, which
   meaningfully lowers the value of that oracle.

5. **No bot protection on the public lead form** — CAPTCHA or
   proof-of-work would help; rate limiting (now implemented) reduces but
   doesn't eliminate the risk.

10. **Unreviewed `npm audit` findings** — 3 high-severity advisories
    exist in the dependency tree and were never triaged.

11. **No idempotency key on the webhook route** — marking a fee `paid`
    happens to be idempotent by luck, not by design.

### MITIGATED — verified safe, with the mechanism

12. **SQL injection**: not present. All queries go through Supabase's
    parameterized query builder / JSON file reads — zero string
    concatenation into SQL.

13. **Mass assignment**: Zod strips unrecognized keys; every DB write
    uses explicitly named fields.

14. **Price/amount tampering**: Razorpay order amount is read from the
    database, never from the client request body.

15. **Self-role-escalation**: no UPDATE policy lets a non-admin edit any
    `users` row. Structurally impossible today.

16. **Payment webhook signature**: HMAC-SHA256, `crypto.timingSafeEqual`
    comparison.

17. **Cross-tenant data leakage**: RLS-tested directly against real
    Postgres.

### ARCHITECTURAL — trust boundaries, not bugs

18. **Password comparison timing**: delegated to Supabase Auth's bcrypt/
    argon2 implementation — outside this codebase's control.

19. **Service-role key as a single high-value secret**: its compromise
    is total. Needs operational controls, not application code.

20. **Session revocation scope on logout**: whether `signOut()` uses
    `scope: 'local'` or `'global'` is a product decision.

---

## Files changed in this security pass

| File | What changed |
|------|-------------|
| `src/lib/db.ts` | Added `DuplicateError` class + `appendToCollectionUnique()` |
| `src/lib/enrollment.ts` | Crypto-secure PRNG, atomic uniqueness check |
| `src/app/api/admin/enroll/route.ts` | Removed TOCTOU pre-check, catches DuplicateError |
| `src/app/api/lead/route.ts` | Wired rate limiting (checkLeadRate + getClientIP) |
| `next.config.ts` | Security headers (CSP, HSTS, X-Frame-Options, etc.) |
| `src/lib/audit.ts` | **NEW** — audit event logger |
| `src/lib/payment-orders.ts` | **NEW** — pending order tracker for idempotency |
| `src/app/api/billing/create-order/route.ts` | Idempotency check before Razorpay call |
| `src/app/api/students/[id]/scores/route.ts` | Audit logging on score recording |
| `src/app/api/students/[id]/attendance/route.ts` | Audit logging on attendance marking |
| `src/app/api/resources/route.ts` | Audit logging on resource upload |
