const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [{ role: String, content: String, timestamp: { type: Date, default: Date.now } }],
  topic: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatHistory", chatSchema);
