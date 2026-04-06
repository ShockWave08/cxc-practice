// ─── Exam History ─────────────────────────────────────────────────────────────
function getExamHistory() {
  return JSON.parse(localStorage.getItem("cxc_exam_history") || "[]");
}

function saveExamResult(result) {
  const history = getExamHistory();
  history.push(result);
  localStorage.setItem("cxc_exam_history", JSON.stringify(history));
}

// ─── Spaced Repetition ────────────────────────────────────────────────────────
// Stores per-question performance: { questionId: { seen, correct, lastSeen, interval } }
function getQuestionStats() {
  return JSON.parse(localStorage.getItem("cxc_question_stats") || "{}");
}

function saveQuestionStat(questionId, wasCorrect) {
  const stats = getQuestionStats();
  const now = Date.now();
  const existing = stats[questionId] || { seen: 0, correct: 0, lastSeen: 0, interval: 0 };

  existing.seen++;
  existing.lastSeen = now;

  if (wasCorrect) {
    existing.correct++;
    // SM-2 inspired: double interval on correct, cap at 30 days
    existing.interval = Math.min((existing.interval || 1) * 2, 30 * 24 * 60 * 60 * 1000);
  } else {
    // Reset interval on wrong answer
    existing.interval = 0;
  }

  stats[questionId] = existing;
  localStorage.setItem("cxc_question_stats", JSON.stringify(stats));
}

// Returns a priority score — lower = higher priority (due for review)
function getSpacedRepetitionScore(questionId) {
  const stats = getQuestionStats();
  const q = stats[questionId];
  if (!q || q.seen === 0) return -Infinity; // Never seen → top priority
  const accuracy = q.correct / q.seen;
  const daysSinceSeen = (Date.now() - q.lastSeen) / (1000 * 60 * 60 * 24);
  const intervalDays = q.interval / (1000 * 60 * 60 * 24);
  const overdue = daysSinceSeen - intervalDays; // positive = overdue
  return accuracy - (overdue * 0.1); // low accuracy + overdue = lowest score
}

function buildSpacedExam(allQuestions, num) {
  const scored = allQuestions.map(q => ({
    q,
    score: getSpacedRepetitionScore(q.id)
  }));
  scored.sort((a, b) => a.score - b.score); // lowest score first
  return scored.slice(0, num).map(s => s.q);
}

// ─── Dark Mode ────────────────────────────────────────────────────────────────
function getDarkMode() {
  return localStorage.getItem("cxc_dark_mode") === "true";
}

function setDarkMode(val) {
  localStorage.setItem("cxc_dark_mode", val);
}

function applyDarkMode() {
  if (getDarkMode()) document.body.classList.add("dark");
  else document.body.classList.remove("dark");
}