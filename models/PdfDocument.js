const mongoose = require("mongoose");

const pdfDocSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  filePath: String,
  extractedText: String,
  summary: String,
  flashcards: [{
    question: String,
    answer: String,
  }],
  keyTopics: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PdfDocument", pdfDocSchema);
