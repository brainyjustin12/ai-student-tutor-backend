const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String,
  }],
  score: Number,
  totalQuestions: Number,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Quiz", quizSchema);
