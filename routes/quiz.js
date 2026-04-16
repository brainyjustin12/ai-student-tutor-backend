const router = require("express").Router();
const auth = require("../middleware/auth");
const Quiz = require("../models/Quiz");
const User = require("../models/User");
const { callOllama } = require("../utils/ollama");

router.post("/", auth, async (req, res) => {
  try {
    const { topic, numQuestions = 5, difficulty = "medium" } = req.body;
    const prompt = `Generate exactly ${numQuestions} multiple choice questions about "${topic}" at ${difficulty} difficulty level for African students.
Return ONLY valid JSON array: [{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]
No extra text, just the JSON array.`;

    const raw = await callOllama(prompt);
    const match = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!match) return res.status(500).json({ error: "Failed to parse quiz" });

    const questions = JSON.parse(match[0]);
    const quiz = await Quiz.create({ userId: req.user.id, topic, questions, totalQuestions: questions.length });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/submit", auth, async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    let score = 0;
    quiz.questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });

    quiz.score = score;
    quiz.completedAt = new Date();
    await quiz.save();

    const user = await User.findById(req.user.id);
    user.totalScore += score;
    user.quizzesTaken += 1;
    user.avgScore = user.totalScore / user.quizzesTaken;
    await user.save();

    res.json({ score, total: quiz.totalQuestions, percentage: Math.round((score / quiz.totalQuestions) * 100) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
