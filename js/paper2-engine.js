// Paper 2 Engine - supports multi-part questions with context
// Question format: { id, context, total_marks, parts: [{ part, question, marks, rubric }] }

let p2Questions = [];      // full question objects
let p2Answers = {};        // { questionIndex: { partIndex: "answer text" } }
let p2Index = 0;           // current question index
let p2TimerInterval;
let p2TimeLeft = 0;
let p2NumQuestions = 0;

// ─── Setup ───────────────────────────────────────────────────────────────────

function startPaper2Exam() {
  if (!allQuestions || allQuestions.length === 0) {
    alert("Questions are still loading. Please wait a moment.");
    return;
  }

  const numInput = document.getElementById("p2-num-questions");
  p2NumQuestions = Math.min(
    parseInt(numInput?.value || 5),
    allQuestions.length
  );

  // Shuffle and pick
  p2Questions = [...allQuestions]
    .sort(() => Math.random() - 0.5)
    .slice(0, p2NumQuestions);

  // Initialise answer store: { qIndex: { partIndex: "" } }
  p2Answers = {};
  p2Questions.forEach((q, qi) => {
    p2Answers[qi] = {};
    q.parts.forEach((_, pi) => { p2Answers[qi][pi] = ""; });
  });

  p2Index = 0;

  document.getElementById("p2-setup").style.display = "none";
  document.getElementById("p2-exam-area").style.display = "block";

  // 12 minutes per question (CXC Paper 2 pace)
  startP2Timer(p2NumQuestions * 12 * 60);
  renderP2Question();
}

// Used by English Paper 2 to start with a pre-filtered set of questions
function startPaper2ExamWithQuestions(questions) {
  p2Questions = questions;
  p2NumQuestions = questions.length;
  p2Index = 0;
  p2Answers = {};
  questions.forEach((_, qi) => {
    p2Answers[qi] = {};
    questions[qi].parts.forEach((_, pi) => { p2Answers[qi][pi] = ""; });
  });
  document.getElementById("p2-setup").style.display = "none";
  document.getElementById("p2-exam-area").style.display = "block";
  startP2Timer(p2NumQuestions * 12 * 60);
  renderP2Question();
}

// ─── Timer ───────────────────────────────────────────────────────────────────

function startP2Timer(seconds) {
  p2TimeLeft = seconds;
  p2TimerInterval = setInterval(() => {
    const mins = Math.floor(p2TimeLeft / 60);
    const secs = p2TimeLeft % 60;
    const el = document.getElementById("p2-timer");
    if (el) {
      el.innerText = `⏱ Time Left: ${mins}:${secs.toString().padStart(2, "0")}`;
      el.style.color = p2TimeLeft < 300 ? "#c0392b" : "#2c3e50";
    }
    p2TimeLeft--;
    if (p2TimeLeft < 0) { clearInterval(p2TimerInterval); submitPaper2(); }
  }, 1000);
}

// ─── Render question ─────────────────────────────────────────────────────────

function renderP2Question() {
  const q = p2Questions[p2Index];
  if (!q) return;

  // Save any answers currently on screen before re-rendering
  saveCurrentAnswers();

  const totalParts = q.parts.length;
  let html = "";

  // Progress
  html += `<p style="color:#7f8c8d; font-size:0.9em;">
    Question ${p2Index + 1} of ${p2Questions.length}
  </p>`;

  // Context box
  html += `
    <div style="background:#eaf0fb; border-left:4px solid #2471a3;
                padding:12px 16px; border-radius:0 6px 6px 0; margin-bottom:16px;">
      <strong>Context:</strong> ${q.context}
    </div>
  `;

  // Strand / topic label
  html += `<p style="font-size:0.85em; color:#7f8c8d; margin-bottom:12px;">
    ${q.strand} &mdash; ${q.topic} &mdash;
    <strong>${q.total_marks} marks</strong>
  </p>`;

  // Each part gets its own textarea
  q.parts.forEach((part, pi) => {
    const savedAnswer = p2Answers[p2Index]?.[pi] || "";
    html += `
      <div style="background:white; border:1px solid #d5d8dc;
                  border-radius:8px; padding:16px; margin-bottom:16px;">
        <p style="margin-bottom:8px;">
          <strong>Part (${part.part})</strong>
          &nbsp;<span style="color:#7f8c8d; font-size:0.85em;">[${part.marks} mark${part.marks > 1 ? "s" : ""}]</span>
        </p>
        <p style="margin-bottom:10px;">${part.question}</p>
        <textarea
          id="p2-answer-${pi}"
          rows="5"
          placeholder="Write your answer and working here..."
          style="width:100%; font-family:inherit; font-size:0.95em;"
        >${savedAnswer}</textarea>
      </div>
    `;
  });

  document.getElementById("p2-question-area").innerHTML = html;

  // Update nav buttons
  document.getElementById("p2-prev-btn").style.display =
    p2Index === 0 ? "none" : "inline-block";
  document.getElementById("p2-next-btn").style.display =
    p2Index === p2Questions.length - 1 ? "none" : "inline-block";
  document.getElementById("p2-submit-btn").style.display =
    p2Index === p2Questions.length - 1 ? "inline-block" : "none";
}

// ─── Answer saving ────────────────────────────────────────────────────────────

function saveCurrentAnswers() {
  const q = p2Questions[p2Index];
  if (!q) return;
  q.parts.forEach((_, pi) => {
    const el = document.getElementById(`p2-answer-${pi}`);
    if (el) p2Answers[p2Index][pi] = el.value;
  });
}

// ─── Navigation ──────────────────────────────────────────────────────────────

function nextP2() {
  saveCurrentAnswers();
  if (p2Index < p2Questions.length - 1) { p2Index++; renderP2Question(); }
  window.scrollTo(0, 0);
}

function prevP2() {
  saveCurrentAnswers();
  if (p2Index > 0) { p2Index--; renderP2Question(); }
  window.scrollTo(0, 0);
}

// ─── Marking ─────────────────────────────────────────────────────────────────

function markAnswer(answerText, rubric) {
  const text = (answerText || "").toLowerCase();
  let score = 0;
  const feedback = [];

  rubric.forEach(rule => {
    const keyword = rule.value.toLowerCase();
    if (text.includes(keyword)) {
      score += rule.marks;
      feedback.push({ pass: true, text: `✅ ${rule.type}: "${rule.value}" (+${rule.marks})` });
    } else {
      feedback.push({ pass: false, text: `❌ Missing: "${rule.value}"` });
    }
  });

  return { score, feedback };
}

// ─── Submit & Results ─────────────────────────────────────────────────────────

function submitPaper2() {
  saveCurrentAnswers();
  clearInterval(p2TimerInterval);

  let grandTotal = 0;
  let grandMax = 0;
  let html = "<h2>📋 Paper 2 Results</h2>";

  p2Questions.forEach((q, qi) => {
    let qScore = 0;
    const qMax = q.total_marks;

    let qHtml = `
      <div style="border:1px solid #d5d8dc; border-radius:8px;
                  padding:16px; margin:16px 0; background:white;">
        <h3 style="margin-bottom:4px;">Question ${qi + 1}: ${q.topic}</h3>
        <p style="color:#7f8c8d; font-size:0.85em; margin-bottom:10px;">
          ${q.strand}
        </p>
        <div style="background:#eaf0fb; border-left:4px solid #2471a3;
                    padding:10px 14px; border-radius:0 6px 6px 0; margin-bottom:14px;">
          ${q.context}
        </div>
    `;

    q.parts.forEach((part, pi) => {
      const answerText = p2Answers[qi]?.[pi] || "";
      const { score, feedback } = markAnswer(answerText, part.rubric);
      qScore += score;

      const partColor = score === part.marks ? "#27ae60"
                      : score > 0            ? "#f39c12"
                                             : "#e74c3c";

      qHtml += `
        <div style="border-top:1px solid #ecf0f1; padding-top:12px; margin-top:12px;">
          <p><strong>Part (${part.part})</strong>
             — <em>${part.question}</em></p>
          <div style="background:#f9f9f9; border:1px solid #ecf0f1;
                      border-radius:6px; padding:10px; margin:8px 0;
                      white-space:pre-wrap; font-size:0.9em; color:#555;">
            ${answerText || "<em style='color:#aaa;'>No answer given</em>"}
          </div>
          <p style="color:${partColor}; font-weight:bold;">
            Score: ${score} / ${part.marks}
          </p>
          <ul style="font-size:0.88em; margin:4px 0 0 16px; color:#555;">
            ${feedback.map(f => `<li>${f.text}</li>`).join("")}
          </ul>
        </div>
      `;
    });

    grandTotal += qScore;
    grandMax   += qMax;
    const qPct = ((qScore / qMax) * 100).toFixed(0);
    const qColor = qPct >= 70 ? "#27ae60" : qPct >= 50 ? "#f39c12" : "#e74c3c";

    qHtml += `
        <div style="border-top:2px solid #d5d8dc; margin-top:14px;
                    padding-top:10px; text-align:right;">
          <strong style="color:${qColor};">
            Question Total: ${qScore} / ${qMax} (${qPct}%)
          </strong>
        </div>
      </div>
    `;

    html += qHtml;
  });

  const pct = ((grandTotal / grandMax) * 100).toFixed(1);
  const grade = pct >= 70 ? "✅ Pass" : pct >= 50 ? "⚠️ Near Pass" : "❌ Needs Work";

  html = `
    <div style="background:#2471a3; color:white; border-radius:8px;
                padding:20px; margin-bottom:20px; text-align:center;">
      <h2 style="margin:0 0 6px;">Final Score</h2>
      <p style="font-size:2em; margin:0; font-weight:bold;">${grandTotal} / ${grandMax}</p>
      <p style="font-size:1.2em; margin:4px 0 0;">${pct}% &mdash; ${grade}</p>
    </div>
  ` + html;

  html += `<a href="index.html" style="display:inline-block; margin-top:20px;">
    ← Back to Mathematics
  </a>`;

  // Save to history
  saveExamResult({
    subject: "Mathematics",
    paper: "Paper 2",
    date: new Date().toISOString(),
    score: grandTotal,
    total: grandMax,
    percent: parseFloat(pct),
    topicStats: buildTopicStats()
  });

  document.getElementById("p2-exam-area").innerHTML = html;
  window.scrollTo(0, 0);
}

// Build topicStats for dashboard compatibility
function buildTopicStats() {
  const stats = {};
  p2Questions.forEach((q, qi) => {
    const topic = q.topic;
    if (!stats[topic]) stats[topic] = { correct: 0, total: 0 };
    q.parts.forEach((part, pi) => {
      const { score } = markAnswer(p2Answers[qi]?.[pi] || "", part.rubric);
      stats[topic].total += part.marks;
      stats[topic].correct += score;
    });
  });
  return stats;
}