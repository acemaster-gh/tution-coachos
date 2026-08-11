# CoachOS — Technical Roadmap & Threat Model

A note on method before the lists: a real security review isn't 20 red
flags — it's a complete pass where some findings are genuinely open and
others are "considered this attack class, here's why it doesn't apply."
Padding a list to a round number with fabricated severity would be
actively misleading. So below, items are honestly marked **OPEN**,
**MITIGATED** (with the mechanism explained), or **ARCHITECTURAL**
(a property of the design, not a bug — can't be "fixed" with a patch).

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

3. **Idempotency keys for payment/enrollment retries.** Right now, if a
   client retries `/api/billing/create-order` after a timeout (not
   knowing if the first request succeeded), it can create a duplicate
   Razorpay order. The fix is a client-generated idempotency key stored
   with the order — a standard distributed-systems technique for making
   an inherently non-idempotent operation (create-and-charge) safe to
   retry.

4. **Token-bucket rate limiting on public endpoints.** `/api/lead` has
   no rate limit — see Vulnerability #5 below. A token bucket (refill
   rate + burst capacity) is the standard primitive here; implemented
   below.

5. **Outbox pattern for notification delivery.** `notify()` currently
   does the external API call and the audit-log write in the same
   request — if the process crashes between "Twilio call succeeded" and
   "audit row written," the record is lost. The outbox pattern writes
   the *intent* to send in the same transaction as the triggering event,
   then a separate worker delivers it — solving the classic **dual-write
   problem** (you can't atomically write to a database and call an
   external API in one transaction).

6. **Materialized aggregates for the admin dashboard.** Every dashboard
   load currently recomputes fee sums and risk tiers by scanning all
   students/fees. Fine at demo scale; at a few thousand students, this
   becomes a materialized view refreshed on write (or a trigger-updated
   summary table) — trading write-time cost for read-time cost, the
   standard database tradeoff.

7. **Full-text search over the resource library** via Postgres
   `tsvector` + a GIN index, instead of client-side substring filtering
   — real information-retrieval indexing instead of O(n) scan per search.

8. **Real-time dashboard updates via Postgres LISTEN/NOTIFY** (which
   Supabase Realtime wraps) — a publish-subscribe pattern so the admin
   dashboard updates when a lead arrives, without polling.

9. **Statistical anomaly detection for scores**, replacing (or
   augmenting) the fixed "3 consecutive drops" rule with a z-score
   against the student's *own* historical mean/variance — a score that's
   2+ standard deviations below their personal baseline is a stronger,
   personalized signal than an absolute threshold.

10. **A real policy engine (RBAC/ABAC) instead of scattered checks.**
    Access rules currently live in three places per route: the API
    handler's `if (role !== ...)`, the RLS policy, and occasionally a
    component. Centralizing this (e.g., with Oso or a custom policy
    table) separates the *mechanism* (checking) from the *policy*
    (rules) — a textbook separation-of-concerns argument.

11. **Connection pooling for serverless + Postgres.** Every serverless
    function invocation can open a new Postgres connection; at real
    traffic this exhausts Postgres's connection limit fast (the
    "connection storm" problem). Supabase's pooler (PgBouncer in
    transaction mode) needs to be the connection target, not the direct
    DB port — worth double-checking this is configured correctly.

12. **Circuit breakers around Razorpay/Twilio/Resend.** If Twilio is
    down, `notify()` currently just fails per-call with no backoff — at
    volume this means every request pays the full timeout cost. A
    circuit breaker (open after N consecutive failures, half-open retry
    after a cooldown) prevents cascading slowness.

13. **Exponential backoff + dead-letter queue for failed sends**,
    instead of "logged once, never retried."

14. **CQRS-lite: separate read models from write models** as scale
    grows — denormalized dashboard views that don't share a schema with
    the normalized transactional tables.

15. **Content-addressable storage for uploaded materials** (hash-based
    filenames) — free deduplication and integrity verification (a
    corrupted file's hash won't match).

16. **Feature flags as a first-class table**, not env vars — enables
    percentage rollouts and per-institute experimentation, the
    infrastructure A/B testing actually requires.

17. **Versioned, reversible migrations** via the Supabase CLI's
    migration tooling instead of manually pasted SQL files — every
    migration needs a tested `down` as much as an `up`.

18. **Property-based testing for the risk/dip algorithms.** Current
    tests are example-based (specific score sequences). Property-based
    testing (e.g., `fast-check`) generates thousands of random sequences
    and asserts *invariants* — e.g., "a strictly monotonically
    increasing score sequence must never produce a risk score above the
    attendance-only baseline" — catching edge cases hand-picked examples
    miss.

19. **Admin action audit log** (who changed what, when) — covered under
    security below too; it's both a feature and a non-repudiation
    control.

20. **Formal edge-case enumeration for the alert rules** — e.g., a
    truth table over (score trend: up/down/flat) × (attendance:
    high/low) × (fees: paid/overdue) to verify every combination
    produces the intended tier, rather than trusting the handful of
    scenarios that happened to get tested.

---

## Part 2 — Security review (20 items, honestly categorized)

### OPEN — real, unaddressed

1. **TOCTOU race in enrollment's email check.** `emailExists()` then
   `createUser()` are two separate calls — two admins enrolling the same
   email within the race window can both pass the check. **Fixing this
   below**: remove the pre-check, rely on the database's unique
   constraint, and handle the resulting error — turning a check-then-act
   race into an atomic constraint violation.
2. **Confused-deputy risk from the service-role client.** Every function
   using `createAdminClient()` carries *ambient authority* — it bypasses
   RLS unconditionally. A single bug in any of those code paths is a
   full-database bug, unlike an RLS-scoped bug, which stays contained to
   what that user could see anyway. This isn't fixable with a patch —
   it's a permanent architectural cost of needing privileged operations
   at all, and the mitigation is discipline: keep the list of
   admin-client call sites small and auditable (it currently is —
   4 files).
3. **Email-enumeration oracle.** The enroll route's `409` on a duplicate
   email confirms an account exists. Accepted tradeoff for now — this
   endpoint is admin-only (not public), which meaningfully lowers the
   value of that oracle to an attacker who'd already need valid admin
   credentials.
4. **No rate limiting on `/api/lead`.** Cheap for an attacker to spam,
   real cost to the business (each submission triggers two external
   notification calls once Twilio/Resend are configured). **Fixing this
   below.**
5. **No bot protection on the public lead form** — same asymmetric-cost
   problem as #4, compounding it.
6. **Insecure PRNG for temp passwords.** `Math.random()` is not
   cryptographically secure — its output is predictable given enough
   samples (it's a non-cryptographic PRNG, not designed to resist
   prediction attacks). **Fixing this below** with `crypto.randomBytes`.
7. **Missing security headers** (CSP, `X-Frame-Options`,
   `Strict-Transport-Security`). **Fixing this below.**
8. **No admin action audit log** — a compromised or malicious admin
   session leaves no trail of *who* changed a grade or marked a fee
   paid outside the webhook path. Non-repudiation gap.
9. **No existing-pending-order check before creating a new Razorpay
   order** — a parent could spam the Pay button and create many
   duplicate pending orders for the same fee. Low severity, real.
10. **Unreviewed `npm audit` findings** — 3 high-severity advisories
    exist in the dependency tree and were never triaged.
11. **No idempotency key on the webhook or create-order routes** — see
    Update #3 above; a retried request isn't provably safe to
    re-process, even though marking a fee `paid` happens to be
    idempotent by luck (setting the same status twice is harmless) — not
    because the code was designed to guarantee that.

### MITIGATED — verified safe, with the mechanism

12. **SQL injection**: not present anywhere. Every query goes through
    Supabase's parameterized query builder — there is zero string
    concatenation into SQL in this codebase (verified by inspection).
    This isn't "sanitized input," it's architectural avoidance of the
    entire vulnerability class.
13. **Mass assignment**: Zod's `z.object()` strips unrecognized keys by
    default (no `.passthrough()` used anywhere), and every DB write uses
    explicitly named fields rather than spreading a raw client payload
    into an `insert()` call. A client can't smuggle `role: "admin"`
    through the enroll form.
14. **Price/amount tampering on payment**: the Razorpay order amount is
    read from `fees.amount` in the database, never trusted from the
    client request body. A modified client request can't discount a fee.
15. **Self-role-escalation**: there's currently no UPDATE policy letting
    a non-admin edit *any* `users` row, including their own — meaning
    the "can a parent set their own role to admin" question is
    structurally impossible today. (Worth re-checking the moment
    self-service profile editing is added — that's exactly when this
    protection needs to be re-verified, not assumed to still hold.)
16. **Payment webhook signature**: HMAC-SHA256, `crypto.timingSafeEqual`
    comparison (not `===`, which leaks timing information proportional
    to how many leading bytes match) — tested against both a forged and
    a genuine signature in Phase 8.
17. **Cross-tenant data leakage**: RLS-tested directly against real
    Postgres — a second institute's admin genuinely gets zero rows for
    the first institute's students/fees, not just "the app doesn't show
    them."

### ARCHITECTURAL — trust boundaries, not bugs

18. **Password comparison timing**: delegated entirely to Supabase
    Auth's internal implementation (bcrypt/argon2-class comparison) —
    outside this codebase's control or audit surface, and appropriately
    so; re-implementing auth primitives ourselves would be strictly
    riskier than trusting a maintained provider.
19. **Service-role key as a single high-value secret**: its compromise
    is total. No amount of application code prevents this — it needs
    operational controls (rotation schedule, restricted access, secret
    manager instead of a `.env` file in production).
20. **Session revocation scope on logout**: whether `signOut()` should
    use `scope: 'local'` (this device only) or `'global'` (all devices)
    is a product decision with security implications, not a bug — needs
    an explicit choice, currently using the default.

---

## What's actually getting fixed in this pass

Items 1, 4, 6, 7 above (the OPEN ones with concrete, self-contained
fixes) — implemented and tested in the same conversation this document
came from. The rest are real backlog, not urgent-and-ignored.
