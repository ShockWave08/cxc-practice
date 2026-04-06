const FORMULA_SECTIONS = [
  {
    title: "📐 Area & Perimeter",
    formulas: [
      { name: "Rectangle area",       formula: "A = l × w" },
      { name: "Triangle area",        formula: "A = ½ × b × h" },
      { name: "Circle area",          formula: "A = πr²" },
      { name: "Trapezium area",       formula: "A = ½(a + b)h" },
      { name: "Parallelogram area",   formula: "A = b × h" },
      { name: "Circle circumference", formula: "C = 2πr = πd" },
    ]
  },
  {
    title: "📦 Volume & Surface Area",
    formulas: [
      { name: "Cuboid volume",        formula: "V = l × w × h" },
      { name: "Cylinder volume",      formula: "V = πr²h" },
      { name: "Cone volume",          formula: "V = ⅓πr²h" },
      { name: "Sphere volume",        formula: "V = (4/3)πr³" },
      { name: "Cuboid surface area",  formula: "SA = 2(lw + lh + wh)" },
      { name: "Cylinder curved SA",   formula: "SA = 2πrh" },
    ]
  },
  {
    title: "💰 Consumer Arithmetic",
    formulas: [
      { name: "Simple Interest",      formula: "SI = PRT / 100" },
      { name: "Compound Interest",    formula: "A = P(1 + r/100)ⁿ" },
      { name: "Profit %",             formula: "% profit = (profit / cost) × 100" },
      { name: "Loss %",               formula: "% loss = (loss / cost) × 100" },
      { name: "Discount",             formula: "Discount = % × original price" },
    ]
  },
  {
    title: "📊 Statistics",
    formulas: [
      { name: "Mean",                 formula: "x̄ = Σx / n" },
      { name: "Range",                formula: "Range = max − min" },
      { name: "Probability",          formula: "P(E) = favourable outcomes / total outcomes" },
      { name: "Complementary prob.",  formula: "P(A') = 1 − P(A)" },
    ]
  },
  {
    title: "🔢 Algebra",
    formulas: [
      { name: "Quadratic formula",    formula: "x = (−b ± √(b²−4ac)) / 2a" },
      { name: "Difference of squares",formula: "a² − b² = (a+b)(a−b)" },
      { name: "Gradient",             formula: "m = (y₂ − y₁) / (x₂ − x₁)" },
      { name: "Straight line",        formula: "y = mx + c" },
      { name: "Midpoint",             formula: "M = ((x₁+x₂)/2, (y₁+y₂)/2)" },
      { name: "Distance",             formula: "d = √((x₂−x₁)² + (y₂−y₁)²)" },
    ]
  },
  {
    title: "📐 Trigonometry",
    formulas: [
      { name: "SOH",                  formula: "sin θ = opposite / hypotenuse" },
      { name: "CAH",                  formula: "cos θ = adjacent / hypotenuse" },
      { name: "TOA",                  formula: "tan θ = opposite / adjacent" },
      { name: "Pythagoras",           formula: "a² + b² = c²" },
      { name: "Sine rule",            formula: "a/sin A = b/sin B = c/sin C" },
      { name: "Cosine rule",          formula: "a² = b² + c² − 2bc cos A" },
    ]
  },
  {
    title: "🔣 Sets",
    formulas: [
      { name: "Union formula",        formula: "n(A∪B) = n(A) + n(B) − n(A∩B)" },
      { name: "Complement",           formula: "A' = ξ − A" },
    ]
  },
  {
    title: "➡️ Vectors & Matrices",
    formulas: [
      { name: "Vector magnitude",     formula: "|v| = √(x² + y²)" },
      { name: "2×2 determinant",      formula: "det[[a,b],[c,d]] = ad − bc" },
      { name: "2×2 inverse",          formula: "A⁻¹ = (1/det) × [[d,−b],[−c,a]]" },
    ]
  },
];

function openFormulaSheet() {
  const overlay = document.getElementById("formula-overlay");
  if (!overlay) return;

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <h2 style="margin:0;">📋 Formula Sheet</h2>
      <button onclick="closeFormulaSheet()"
              style="background:#e74c3c; color:white; border:none;
                     border-radius:50%; width:32px; height:32px;
                     font-size:1.1em; cursor:pointer; line-height:1;">✕</button>
    </div>
  `;

  FORMULA_SECTIONS.forEach(section => {
    html += `<div style="margin-bottom:20px;">
      <h3 style="color:#2471a3; border-bottom:1px solid #d5d8dc;
                 padding-bottom:6px; margin-bottom:10px;">${section.title}</h3>
      <table style="width:100%; border-collapse:collapse; font-size:0.9em;">`;
    section.formulas.forEach(f => {
      html += `
        <tr>
          <td style="padding:5px 8px; color:#555; width:50%;">${f.name}</td>
          <td style="padding:5px 8px; font-family:monospace; font-size:1em;
                     background:#f4f6f8; border-radius:4px;">${f.formula}</td>
        </tr>`;
    });
    html += `</table></div>`;
  });

  overlay.innerHTML = `<div style="background:var(--bg); max-width:640px; width:95%;
    max-height:90vh; overflow-y:auto; border-radius:12px; padding:24px;
    box-shadow:0 8px 32px rgba(0,0,0,0.2);">${html}</div>`;
  overlay.style.display = "flex";
}

function closeFormulaSheet() {
  const overlay = document.getElementById("formula-overlay");
  if (overlay) overlay.style.display = "none";
}

// Close on backdrop click
document.addEventListener("click", e => {
  const overlay = document.getElementById("formula-overlay");
  if (e.target === overlay) closeFormulaSheet();
});