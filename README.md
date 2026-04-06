# CXC Practice Hub

A GitHub Pages site for Caribbean students preparing for CXC/CSEC examinations.

## Subjects Covered
- Mathematics (Paper 1 & Paper 2)
- English *(coming soon)*
- Social Studies (Paper 1 & Paper 2)
- Physical Education (Paper 1 & Paper 2)
- Integrated Science *(coming soon)*
- Principles of Business *(coming soon)*
- Principles of Accounts *(coming soon)*
- Information Technology *(coming soon)*

## Features
- Multiple choice (Paper 1) with timer and difficulty filtering
- Structured questions (Paper 2) with keyword-based marking
- Adaptive mode — focuses questions on your weak topics
- Dashboard tracking scores and topic performance over time

## Deploying to GitHub Pages

1. Push this folder as the root of your repository (or a `/docs` folder).
2. Go to **Settings → Pages** in your repo.
3. Set the source to the branch and folder containing `index.html`.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## Adding Questions

Edit the JSON files in each subject folder:
- `paper1-questions.json` — multiple choice questions
- `paper2-questions.json` — structured questions with rubric

Each Paper 1 question should follow this format:
```json
{
  "id": 1,
  "strand": "STRAND G: ALGEBRA",
  "unit": "Unit 25: Solving Equations",
  "topic": "Linear Equations",
  "difficulty": 2,
  "question": "Solve: 2x + 3 = 11",
  "options": ["3", "4", "5", "6"],
  "answer": 1,
  "explanation": "2x = 8 → x = 4"
}
```
(`answer` is the zero-based index of the correct option.)
