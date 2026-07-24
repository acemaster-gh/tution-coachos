import type { Student, Fee } from "./types";

export type RiskTier = "low" | "medium" | "high";

export interface RiskFactor {
  label: string;
  points: number; // 0..maxPoints
  maxPoints: number;
  detail: string;
}

export interface RiskAssessment {
  score: number; // 0..100
  tier: RiskTier;
  factors: RiskFactor[];
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Score-trend risk (0..40): compares the average of the most recent
 * tests against the average of the tests before that, rather than the
 * simpler "three strictly decreasing tests" rule (which is still used
 * for alert-triggering — this is a richer signal layered on top for
 * prioritization, not a replacement of the tested alert logic).
 * Also adds a small penalty if the latest score is very low outright,
 * even without a clear downward trend — a consistently struggling
 * student is still a real risk.
 */
function scoreTrendFactor(student: Student): RiskFactor {
  const scores = student.scores;
  const pct = scores.map((s) => (s.score / s.maxScore) * 100);

  if (pct.length < 2) {
    return { label: "Score trend", points: 0, maxPoints: 40, detail: "Not enough tests yet to assess a trend." };
  }

  const windowSize = Math.min(3, Math.floor(pct.length / 2)) || 1;
  const recent = pct.slice(-windowSize);
  const prior = pct.slice(-windowSize * 2, -windowSize);

  const recentAvg = average(recent);
  const priorAvg = prior.length > 0 ? average(prior) : recentAvg;
  const trendDelta = recentAvg - priorAvg; // negative = declining

  let trendPoints = 0;
  if (trendDelta < 0) {
    trendPoints = Math.min(32, Math.round(-trendDelta * 1.8));
  }

  const latestPct = pct.at(-1)!;
  const lowLevelPoints = latestPct < 40 ? 10 : latestPct < 55 ? 5 : 0;

  const points = Math.min(40, trendPoints + lowLevelPoints);

  const detailParts: string[] = [];
  if (trendDelta < -2) detailParts.push(`recent average down ${Math.abs(Math.round(trendDelta))} pts vs prior tests`);
  if (latestPct < 55) detailParts.push(`latest score ${Math.round(latestPct)}%`);
  const detail = detailParts.length > 0 ? detailParts.join("; ") : "Stable or improving.";

  return { label: "Score trend", points, maxPoints: 40, detail };
}

/**
 * Attendance risk (0..35): recent attendance (last 10 records) weighted
 * more heavily than lifetime attendance — a student who was fine for
 * months but has gone missing the last two weeks is a different (and
 * more urgent) risk than one with consistently mediocre attendance.
 */
function attendanceFactor(student: Student): RiskFactor {
  const records = student.attendance;
  if (records.length === 0) {
    return { label: "Attendance", points: 0, maxPoints: 35, detail: "No attendance recorded yet." };
  }

  const recentWindow = records.slice(-10);
  const recentPct = (recentWindow.filter((r) => r.present).length / recentWindow.length) * 100;

  const points = Math.min(35, Math.max(0, Math.round((80 - recentPct) * 0.65)));
  const detail = `${Math.round(recentPct)}% present over the last ${recentWindow.length} recorded days.`;

  return { label: "Attendance", points, maxPoints: 35, detail };
}

/**
 * Fee risk (0..25): overdue fees are a meaningful churn signal — a
 * family behind on payment is disproportionately likely to be the one
 * that quietly doesn't renew next term.
 */
function feeFactor(fees: Fee[], today = new Date()): RiskFactor {
  const overdue = fees.filter((f) => f.status !== "paid" && new Date(f.dueDate) < today);
  const pendingSoon = fees.filter((f) => {
    if (f.status === "paid") return false;
    const daysUntilDue = (new Date(f.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  });

  if (overdue.length > 0) {
    return { label: "Fee status", points: 25, maxPoints: 25, detail: `${overdue.length} overdue fee${overdue.length > 1 ? "s" : ""}.` };
  }
  if (pendingSoon.length > 0) {
    return { label: "Fee status", points: 8, maxPoints: 25, detail: "A fee is due within the week." };
  }
  return { label: "Fee status", points: 0, maxPoints: 25, detail: "No overdue or upcoming fees." };
}

export function computeRiskScore(student: Student, fees: Fee[]): RiskAssessment {
  const factors = [scoreTrendFactor(student), attendanceFactor(student), feeFactor(fees)];
  const score = Math.min(100, factors.reduce((sum, f) => sum + f.points, 0));
  const tier: RiskTier = score >= 55 ? "high" : score >= 20 ? "medium" : "low";

  return { score, tier, factors };
}
