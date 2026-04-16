const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalText: String,
  summary: String,
  sourceType: { type: String, enum: ["text", "pdf"], default: "text" },
  fileName: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Summary", summarySchema);
