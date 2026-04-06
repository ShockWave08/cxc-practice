// Loads questions from a JSON file path into the global allQuestions array
function loadQuestions(path, paperType) {
  const type = paperType || "paper1";
  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch: " + path);
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        allQuestions = data;
      } else if (data[type]) {
        allQuestions = data[type];
      } else {
        console.error("Unexpected question format:", data);
      }
      console.log("Questions loaded:", allQuestions.length);
    })
    .catch(err => console.error("Failed to load questions:", err));
}
