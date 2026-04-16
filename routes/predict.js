const router = require("express").Router();
const auth = require("../middleware/auth");
const Quiz = require("../models/Quiz");
const { callOllama } = require("../utils/ollama");

router.get("/", auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id, completedAt: { $ne: null } }).sort({ completedAt: -1 }).limit(20);

    if (quizzes.length < 2) {
      return res.json({ prediction: "Not enough data. Complete at least 2 quizzes for predictions.", insights: [], riskLevel: "unknown" });
    }

    const stats = quizzes.map(q => ({
      topic: q.topic,
      score: q.score,
      total: q.totalQuestions,
      pct: Math.round((q.score / q.totalQuestions) * 100),
      date: q.completedAt,
    }));

    const prompt = `Analyze this student performance data and predict future performance. Provide actionable advice for an African student.
Data: ${JSON.stringify(stats)}
Return JSON: {"prediction":"...","insights":["..."],"riskLevel":"low|medium|high","suggestedTopics":["..."],"strengths":["..."],"weaknesses":["..."]}`;

    const raw = await callOllama(prompt);
    const match = raw.match(/\{[\s\S]*\}/);
    const result = match ? JSON.parse(match[0]) : { prediction: raw, insights: [], riskLevel: "medium" };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
