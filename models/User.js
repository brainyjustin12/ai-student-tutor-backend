const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  school: { type: String, default: "" },
  grade: { type: String, default: "" },
  country: { type: String, default: "Rwanda" },
  subjects: [String],
  totalScore: { type: Number, default: 0 },
  quizzesTaken: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
