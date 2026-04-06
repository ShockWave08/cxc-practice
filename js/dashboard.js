// ─── Colour palette — one colour per subject ───────────────────────────────
const SUBJECT_COLORS = {
  "Mathematics":              "#2471a3",
  "English":                  "#27ae60",
  "Social Studies":           "#8e44ad",
  "Physical Education":       "#e67e22",
  "Integrated Science":       "#16a085",
  "Principles of Business":   "#c0392b",
  "Principles of Accounts":   "#d4ac0d",
  "Information Technology":   "#2980b9",
};

function subjectColor(name) {
  return SUBJECT_COLORS[name] || "#7f8c8d";
}

// Subject → relative path to its paper1.html (from dashboard root)
const SUBJECT_PAPER1 = {
  "Mathematics":            "subjects/mathematics/paper1.html",
  "English":                "subjects/english/paper1.html",
  "Social Studies":         "subjects/social-studies/paper1.html",
  "Physical Education":     "subjects/physical-education/paper1.html",
  "Integrated Science":     "subjects/integrated-science/paper1.html",
  "Principles of Business": "subjects/principles-of-business/paper1.html",
  "Principles of Accounts": "subjects/principles-of-accounts/paper1.html",
  "Information Technology": "subjects/information-technology/paper1.html",
};

// ─── Main render ───────────────────────────────────────────────────────────
function renderDashboard() {
  const history = getExamHistory();

  if (!history.length) {
    document.getElementById("summary-cards").innerHTML =
      "<p>No exam history yet. Complete a practice exam to see your progress here.</p>";
    ["weak-topics","chart-area","topic-performance","history-table"]
      .forEach(id => { document.getElementById(id).innerHTML = ""; });
    return;
  }

  // ── Summary cards ──────────────────────────────────────────────────────────
  const totalExams = history.length;
  const avgScore   = (history.reduce((s, i) => s + i.percent, 0) / totalExams).toFixed(1);
  const latest     = history[history.length - 1];
  const subjects   = [...new Set(history.map(h => h.subject))];

  document.getElementById("summary-cards").innerHTML = `
    <div class="card"><strong>Total Exams</strong><br>${totalExams}</div>
    <div class="card"><strong>Overall Average</strong><br>${avgScore}%</div>
    <div class="card"><strong>Subjects Studied</strong><br>${subjects.length}</div>
    <div class="card"><strong>Latest</strong><br>${latest.subject}<br>${latest.paper} — ${latest.percent}%</div>
  `;

  renderWeakTopics(history, subjects);
  renderCharts(history, subjects);
  renderTopicStrength(history, subjects);
  renderHistoryTable(history);
}

// ─── Weak Topics — grouped by subject ─────────────────────────────────────
function renderWeakTopics(history, subjects) {
  const weakEl = document.getElementById("weak-topics");
  let html = "";

  subjects.forEach(subject => {
    const combined = buildTopicCombined(history, subject);
    const weak = Object.entries(combined)
      .map(([topic, s]) => ({ topic, acc: (s.correct / s.total) * 100 }))
      .filter(t => t.acc < 70)
      .sort((a, b) => a.acc - b.acc);

    if (!weak.length) return;

    const color  = subjectColor(subject);
    const p1path = SUBJECT_PAPER1[subject] || "#";

    html += `
      <div style="margin-bottom:20px;">
        <h3 style="color:${color}; border-bottom:2px solid ${color};
                   padding-bottom:4px; margin-bottom:10px;">${subject}</h3>
    `;

    weak.forEach(({ topic, acc }) => {
      const barColor = acc < 50 ? "#e74c3c" : "#f39c12";
      html += `
        <div style="display:flex; align-items:center; gap:12px;
                    padding:10px 14px; background:white; border-radius:8px;
                    border:1px solid #d5d8dc; margin-bottom:8px;">
          <div style="flex:1;">
            <strong>${topic}</strong>
            <div style="background:#ecf0f1; border-radius:4px; height:8px;
                        margin-top:4px; overflow:hidden;">
              <div style="background:${barColor}; width:${acc.toFixed(0)}%;
                          height:100%;"></div>
            </div>
            <small style="color:${barColor};">${acc.toFixed(1)}%</small>
          </div>
          <a href="${p1path}"
             style="background:${color}; color:white; padding:6px 12px;
                    border-radius:6px; font-size:0.85em; white-space:nowrap;
                    text-decoration:none;">Practise →</a>
        </div>`;
    });

    html += `</div>`;
  });

  if (!html) {
    html = "<p style='color:#27ae60;'>✅ No weak topics yet — keep it up!</p>";
  }

  weakEl.innerHTML = html;
}

// ─── Performance Over Time — one line per subject ─────────────────────────
function renderCharts(history, subjects) {
  const container = document.getElementById("chart-area");
  container.innerHTML = "";

  subjects.forEach(subject => {
    const subHistory = history.filter(h => h.subject === subject);
    if (subHistory.length < 2) return; // need at least 2 points for a line

    const color  = subjectColor(subject);
    const W = 800, H = 180;

    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "24px";

    const label = document.createElement("h3");
    label.style.color = color;
    label.style.marginBottom = "6px";
    label.textContent = subject;
    wrapper.appendChild(label);

    const canvas = document.createElement("canvas");
    canvas.width  = W;
    canvas.height = H;
    canvas.style.cssText = `max-width:100%; background:white; border:1px solid #d5d8dc;
                            border-radius:8px; display:block;`;
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    const ctx   = canvas.getContext("2d");
    const stepX = W / (subHistory.length - 1);

    // Grid lines at 25, 50, 75, 100
    ctx.strokeStyle = "#ecf0f1";
    ctx.lineWidth   = 1;
    [25, 50, 70, 75, 100].forEach(pct => {
      const y = H - (pct / 100) * H;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.fillStyle = "#bdc3c7";
      ctx.font = "10px sans-serif";
      ctx.fillText(`${pct}%`, 4, y - 3);
    });

    // 70% pass line highlight
    const passY = H - 0.7 * H;
    ctx.strokeStyle = "#f39c12";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, passY); ctx.lineTo(W, passY); ctx.stroke();
    ctx.setLineDash([]);

    // Subject line
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    subHistory.forEach((h, i) => {
      const x = i * stepX;
      const y = H - (h.percent / 100) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots + score labels
    subHistory.forEach((h, i) => {
      const x = i * stepX;
      const y = H - (h.percent / 100) * H;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = "#2c3e50";
      ctx.font = "10px sans-serif";
      ctx.fillText(`${h.percent}%`, x + 6, y - 4);
    });
  });

  // If no subject had 2+ results yet, show a note
  if (!container.innerHTML) {
    container.innerHTML =
      "<p style='color:#7f8c8d;'>Complete at least 2 exams per subject to see a progress line.</p>";
  }
}

// ─── Topic Strength — grouped by subject ──────────────────────────────────
function renderTopicStrength(history, subjects) {
  const el  = document.getElementById("topic-performance");
  let html  = "";

  subjects.forEach(subject => {
    const combined = buildTopicCombined(history, subject);
    if (!Object.keys(combined).length) return;

    const color = subjectColor(subject);

    html += `
      <div style="margin-bottom:28px;">
        <h3 style="color:${color}; border-bottom:2px solid ${color};
                   padding-bottom:4px; margin-bottom:12px;">${subject}</h3>
    `;

    // Sort: weakest first
    Object.entries(combined)
      .map(([topic, s]) => ({ topic, acc: (s.correct / s.total) * 100 }))
      .sort((a, b) => a.acc - b.acc)
      .forEach(({ topic, acc }) => {
        const barColor = acc >= 70 ? "#27ae60" : acc >= 50 ? "#f39c12" : "#e74c3c";
        html += `
          <div style="margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between;
                        font-size:0.88em; margin-bottom:3px;">
              <span>${topic}</span>
              <span style="color:${barColor}; font-weight:bold;">${acc.toFixed(1)}%</span>
            </div>
            <div style="background:#ecf0f1; border-radius:4px;
                        height:10px; overflow:hidden;">
              <div style="background:${barColor}; width:${acc.toFixed(0)}%;
                          height:100%; transition:width 0.4s;"></div>
            </div>
          </div>`;
      });

    html += `</div>`;
  });

  el.innerHTML = html || "<p style='color:#7f8c8d;'>No topic data yet.</p>";
}

// ─── History Table ─────────────────────────────────────────────────────────
function renderHistoryTable(history) {
  let table = `<table>
    <tr><th>Date</th><th>Subject</th><th>Paper</th><th>Score</th><th>%</th></tr>`;

  history.slice().reverse().forEach(item => {
    const pct   = item.percent;
    const color = pct >= 70 ? "#27ae60" : pct >= 50 ? "#f39c12" : "#e74c3c";
    const dot   = `<span style="display:inline-block; width:10px; height:10px;
                   border-radius:50%; background:${subjectColor(item.subject)};
                   margin-right:6px;"></span>`;
    table += `<tr>
      <td>${new Date(item.date).toLocaleString()}</td>
      <td>${dot}${item.subject}</td>
      <td>${item.paper}</td>
      <td>${item.score}/${item.total}</td>
      <td style="color:${color}; font-weight:bold;">${pct}%</td>
    </tr>`;
  });

  table += `</table>`;
  document.getElementById("history-table").innerHTML = table;
}

// ─── Helper — build combined topic stats for one subject ──────────────────
function buildTopicCombined(history, subject) {
  const combined = {};
  history
    .filter(h => h.subject === subject)
    .forEach(exam => {
      for (const topic in exam.topicStats) {
        if (!combined[topic]) combined[topic] = { correct: 0, total: 0 };
        combined[topic].correct += exam.topicStats[topic].correct;
        combined[topic].total   += exam.topicStats[topic].total;
      }
    });
  return combined;
}

// ─── Dark Mode toggle ──────────────────────────────────────────────────────
function initDarkToggle() {
  const btn = document.getElementById("dark-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = !getDarkMode();
    setDarkMode(next);
    applyDarkMode();
    btn.innerText = next ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
  btn.innerText = getDarkMode() ? "☀️ Light Mode" : "🌙 Dark Mode";
}

applyDarkMode();
renderDashboard();
initDarkToggle();