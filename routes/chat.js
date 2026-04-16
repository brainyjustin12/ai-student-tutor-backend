const router = require("express").Router();
const auth = require("../middleware/auth");
const ChatHistory = require("../models/ChatHistory");
const { callOllama } = require("../utils/ollama");

router.post("/", auth, async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const systemPrompt = "You are an expert AI tutor for students in Rwanda and Africa. Explain concepts clearly with examples relevant to African students. Be encouraging and patient.";

    const reply = await callOllama(message, systemPrompt);

    let chat;
    if (chatId) {
      chat = await ChatHistory.findById(chatId);
      chat.messages.push({ role: "user", content: message }, { role: "assistant", content: reply });
      await chat.save();
    } else {
      chat = await ChatHistory.create({
        userId: req.user.id,
        topic: message.substring(0, 50),
        messages: [{ role: "user", content: message }, { role: "assistant", content: reply }],
      });
    }

    res.json({ reply, chatId: chat._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/history", auth, async (req, res) => {
  try {
    const chats = await ChatHistory.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
