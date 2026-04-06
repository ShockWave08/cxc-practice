function getWeakTopics(subject) {
  const history = getExamHistory().filter(h => h.subject === subject);
  const topicTotals = {};

  history.forEach(exam => {
    for (const topic in exam.topicStats) {
      if (!topicTotals[topic]) topicTotals[topic] = { correct: 0, total: 0 };
      topicTotals[topic].correct += exam.topicStats[topic].correct;
      topicTotals[topic].total += exam.topicStats[topic].total;
    }
  });

  const weakTopics = [];
  for (const topic in topicTotals) {
    const accuracy = (topicTotals[topic].correct / topicTotals[topic].total) * 100;
    if (accuracy < 70) weakTopics.push({ topic, accuracy });
  }
  return weakTopics.sort((a, b) => a.accuracy - b.accuracy);
}

function buildAdaptiveExam(allQuestions, subject, numQuestions) {
  const weakTopics = getWeakTopics(subject);
  const weakTopicNames = weakTopics.map(t => t.topic);

  if (!weakTopics.length) {
    return allQuestions.sort(() => Math.random() - 0.5).slice(0, numQuestions);
  }

  const weakPool = allQuestions.filter(q => weakTopicNames.includes(q.topic));
  const normalPool = allQuestions.filter(q => !weakTopicNames.includes(q.topic));

  weakPool.sort(() => Math.random() - 0.5);
  normalPool.sort(() => Math.random() - 0.5);

  const weakCount = Math.min(Math.ceil(numQuestions * 0.6), weakPool.length);
  const normalCount = Math.min(numQuestions - weakCount, normalPool.length);

  return [...weakPool.slice(0, weakCount), ...normalPool.slice(0, normalCount)]
    .sort(() => Math.random() - 0.5);
}
