let allQuestions = [];
let examQuestions = [];
let userAnswers = [];
let flagged = [];          // bool[] — flagged questions
let currentIndex = 0;
let timerInterval;
let timeLeft = 0;
let unitStats = {};
let SUBJECT = "Unknown";
let reviewMode = false;    // true when in answer-review overlay

// ─── Timer ────────────────────────────────────────────────────────────────────
function startTimer(seconds) {
  timeLeft = seconds;
  timerInterval = setInterval(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const el = document.getElementById("timer");
    if (el) {
      el.innerText = `⏱ ${mins}:${secs.toString().padStart(2, "0")}`;
      el.style.color = timeLeft < 120 ? "#c0392b" : "";
    }
    timeLeft--;
    if (timeLeft < 0) { clearInterval(timerInterval); submitExam(); }
  }, 1000);
}

// ─── Show Question ────────────────────────────────────────────────────────────
function showQuestion() {
  const q = examQuestions[currentIndex];
  if (!q) return;

  const isFlagged = flagged[currentIndex];

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <span style="color:#7f8c8d; font-size:0.9em;">
        Question ${currentIndex + 1} of ${examQuestions.length}
      </span>
      <button onclick="toggleFlag()"
        style="background:${isFlagged ? "#e67e22" : "#bdc3c7"}; color:white;
               border:none; border-radius:5px; padding:5px 12px; cursor:pointer; font-size:0.85em;">
        ${isFlagged ? "🚩 Flagged" : "⚑ Flag"}
      </button>
    </div>
    ${q.passage ? `<div style="background:#f4f6f8; border-left:4px solid #2471a3;
      padding:12px 16px; border-radius:0 6px 6px 0; margin-bottom:14px;
      white-space:pre-line; font-size:0.92em; line-height:1.6;">${q.passage}</div>` : ''}
    <h3 style="margin-bottom:14px;">${q.question}</h3>
  `;

  q.options.forEach((opt, i) => {
    const checked = userAnswers[currentIndex] === i ? "checked" : "";
    html += `
      <div style="margin:8px 0; padding:8px 12px; border:1px solid #d5d8dc;
                  border-radius:6px; cursor:pointer;"
           onclick="selectOption(${i})" id="opt-${i}">
        <label style="cursor:pointer; display:flex; align-items:center; gap:10px;">
          <input type="radio" name="q" value="${i}" ${checked}
                 onchange="saveAnswer(${i})" style="cursor:pointer;">
          <span>${opt}</span>
        </label>
      </div>`;
  });

  html += `
    <div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
      <button onclick="prevQuestion()">← Back</button>
      <button onclick="nextQuestion()">Next →</button>
      <button onclick="openReview()"
              style="background:#8e44ad; margin-left:auto;">
        📋 Review All
      </button>
    </div>
  `;

  document.getElementById("question-container").innerHTML = html;
  highlightSelected();
}

function highlightSelected() {
  examQuestions[currentIndex]?.options.forEach((_, i) => {
    const el = document.getElementById(`opt-${i}`);
    if (!el) return;
    el.style.background = userAnswers[currentIndex] === i ? "#eaf0fb" : "";
    el.style.borderColor = userAnswers[currentIndex] === i ? "#2471a3" : "#d5d8dc";
  });
}

function selectOption(i) {
  saveAnswer(i);
  // update radio
  const radio = document.querySelector(`input[name="q"][value="${i}"]`);
  if (radio) radio.checked = true;
  highlightSelected();
}

function saveAnswer(val) {
  userAnswers[currentIndex] = val;
  highlightSelected();
}

function toggleFlag() {
  flagged[currentIndex] = !flagged[currentIndex];
  showQuestion();
}

function nextQuestion() {
  if (currentIndex < examQuestions.length - 1) { currentIndex++; showQuestion(); }
}
function prevQuestion() {
  if (currentIndex > 0) { currentIndex--; showQuestion(); }
}

// ─── Review Mode ─────────────────────────────────────────────────────────────
function openReview() {
  const overlay = document.getElementById("review-overlay");
  if (!overlay) return;

  let html = `<h2 style="margin-top:0;">📋 Answer Review</h2>
    <p style="color:#7f8c8d; margin-bottom:16px;">
      Click any question to jump to it. Close to continue.
    </p>
    <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(60px,1fr)); gap:8px; margin-bottom:20px;">
  `;

  examQuestions.forEach((_, i) => {
    const answered = userAnswers[i] !== null && userAnswers[i] !== undefined;
    const isFlagged = flagged[i];
    const bg = isFlagged ? "#e67e22" : answered ? "#27ae60" : "#bdc3c7";
    const label = isFlagged ? "🚩" : answered ? "✓" : "–";
    html += `
      <button onclick="jumpTo(${i})"
        style="background:${bg}; color:white; border:none; border-radius:6px;
               padding:10px 4px; cursor:pointer; font-size:0.85em; text-align:center;">
        <div style="font-weight:bold;">Q${i + 1}</div>
        <div>${label}</div>
      </button>`;
  });

  html += `</div>`;

  // Summary counts
  const answeredCount = userAnswers.filter(a => a !== null && a !== undefined).length;
  const flaggedCount  = flagged.filter(Boolean).length;
  const skippedCount  = examQuestions.length - answeredCount;

  html += `
    <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px;">
      <span style="background:#27ae60; color:white; padding:4px 10px; border-radius:4px; font-size:0.85em;">
        ✓ Answered: ${answeredCount}
      </span>
      <span style="background:#bdc3c7; color:white; padding:4px 10px; border-radius:4px; font-size:0.85em;">
        – Skipped: ${skippedCount}
      </span>
      <span style="background:#e67e22; color:white; padding:4px 10px; border-radius:4px; font-size:0.85em;">
        🚩 Flagged: ${flaggedCount}
      </span>
    </div>
    <div style="display:flex; gap:10px;">
      <button onclick="closeReview()">Continue Exam</button>
      <button onclick="submitExam()" style="background:#c0392b;">Submit Now</button>
    </div>
  `;

  overlay.innerHTML = html;
  overlay.style.display = "flex";
}

function jumpTo(i) {
  closeReview();
  currentIndex = i;
  showQuestion();
}

function closeReview() {
  const overlay = document.getElementById("review-overlay");
  if (overlay) overlay.style.display = "none";
}

// ─── Submit ───────────────────────────────────────────────────────────────────
function submitExam() {
  clearInterval(timerInterval);
  closeReview();

  let score = 0;
  let topicStats = {};
  unitStats = {};

  examQuestions.forEach((q, i) => {
    const correct = q.answer === userAnswers[i];

    if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
    topicStats[q.topic].total++;
    if (!unitStats[q.unit]) unitStats[q.unit] = { correct: 0, total: 0 };
    unitStats[q.unit].total++;

    if (correct) {
      score++;
      topicStats[q.topic].correct++;
      unitStats[q.unit].correct++;
    }

    // Record for spaced repetition
    saveQuestionStat(q.id, correct);
  });

  const percent = examQuestions.length > 0
    ? ((score / examQuestions.length) * 100).toFixed(1) : "0.0";

  saveExamResult({
    subject: SUBJECT,
    paper: "Paper 1",
    date: new Date().toISOString(),
    score,
    total: examQuestions.length,
    percent: parseFloat(percent),
    topicStats
  });

  // Results with explanations
  let html = `
    <div style="background:#2471a3; color:white; border-radius:8px;
                padding:20px; margin-bottom:20px; text-align:center;">
      <h2 style="margin:0 0 6px;">Results</h2>
      <p style="font-size:2em; margin:0; font-weight:bold;">${score}/${examQuestions.length}</p>
      <p style="font-size:1.1em; margin:4px 0 0;">${percent}%</p>
    </div>
    <h3>Question Review</h3>
  `;

  examQuestions.forEach((q, i) => {
    const userAns  = userAnswers[i];
    const correct  = q.answer === userAns;
    const answered = userAns !== null && userAns !== undefined;
    const border   = correct ? "#27ae60" : "#e74c3c";

    html += `
      <div style="border:2px solid ${border}; border-radius:8px;
                  padding:14px; margin-bottom:12px; background:white;">
        <p style="font-weight:bold; margin-bottom:8px;">
          ${correct ? "✅" : "❌"} Q${i + 1}: ${q.question}
          ${flagged[i] ? ' <span style="color:#e67e22;">🚩</span>' : ""}
        </p>
        <p style="font-size:0.88em; color:#555; margin:2px 0;">
          Your answer:
          <strong>${answered ? q.options[userAns] : "Not answered"}</strong>
        </p>
        ${!correct ? `<p style="font-size:0.88em; color:#27ae60; margin:2px 0;">
          Correct answer: <strong>${q.options[q.answer]}</strong>
        </p>` : ""}
        <div style="background:#f4f6f8; border-radius:5px;
                    padding:8px 10px; margin-top:8px; font-size:0.85em; color:#444;">
          💡 ${q.explanation}
        </div>
      </div>
    `;
  });

  html += `<h3>Topic Performance</h3><ul>`;
  for (const topic in topicStats) {
    const stat = topicStats[topic];
    const acc  = (stat.correct / stat.total) * 100;
    const label = acc >= 70 ? "✅ Strong" : acc >= 50 ? "⚠️ Average" : "❌ Weak";
    html += `<li>${topic}: ${acc.toFixed(1)}% — ${label}</li>`;
  }
  html += `</ul><a href="../../index.html">← Back to Subjects</a>`;

  document.getElementById("results").innerHTML = html;
  document.getElementById("question-container").innerHTML = "";
  const btn = document.getElementById("submit-btn");
  if (btn) btn.style.display = "none";
  const timer = document.getElementById("timer");
  if (timer) timer.innerText = "";
}

// ─── Start Exam ───────────────────────────────────────────────────────────────
function startExam(subjectName) {
  if (subjectName) SUBJECT = subjectName;

  if (!allQuestions || allQuestions.length === 0) {
    alert("Questions are still loading. Please wait a moment.");
    return;
  }

  const difficulty    = document.getElementById("difficulty")?.value || "all";
  const unit          = document.getElementById("unit")?.value || "all";
  const num           = parseInt(document.getElementById("numQuestions")?.value || 10);
  const adaptiveMode  = document.getElementById("adaptiveMode")?.checked || false;
  const spacedMode    = document.getElementById("spacedMode")?.checked || false;

  unitStats = {};

  if (spacedMode) {
    examQuestions = buildSpacedExam(allQuestions, num);
  } else if (adaptiveMode) {
    examQuestions = buildAdaptiveExam(allQuestions, SUBJECT, num);
  } else {
    examQuestions = allQuestions.filter(q => {
      const diffMatch = difficulty === "all" || q.difficulty == difficulty;
      const unitMatch = unit === "all" || q.unit === unit;
      return diffMatch && unitMatch;
    });
    examQuestions.sort(() => Math.random() - 0.5);
    examQuestions = examQuestions.slice(0, num);
  }

  if (examQuestions.length === 0) {
    alert("No questions found for your selected filters.");
    return;
  }

  userAnswers = new Array(examQuestions.length).fill(null);
  flagged     = new Array(examQuestions.length).fill(false);
  currentIndex = 0;

  document.getElementById("setup").style.display = "none";
  document.getElementById("submit-btn").style.display = "inline-block";

  startTimer(num * 60);
  showQuestion();
}