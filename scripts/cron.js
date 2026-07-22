// Hits the alert-check and fee-reminder endpoints on a running instance.
// Point BASE_URL at your deployed site and schedule this daily (Vercel
// Cron, a system crontab, GitHub Actions schedule — whatever you have).
//
// Run: node scripts/cron.js
// Or:  BASE_URL=https://your-site.example node scripts/cron.js

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function hit(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const body = await res.json();
  console.log(`${path} ->`, JSON.stringify(body, null, 2));
}

async function main() {
  console.log(`Running scheduled checks against ${BASE_URL}\n`);
  await hit("/api/alerts/check");
  await hit("/api/billing/reminders");
}

main().catch((err) => {
  console.error("Cron run failed:", err.message);
  process.exit(1);
});
