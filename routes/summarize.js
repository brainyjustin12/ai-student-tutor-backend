const router = require("express").Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Summary = require("../models/Summary");
const { callOllama } = require("../utils/ollama");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    let text = req.body.text || "";
    let sourceType = "text";
    let fileName = "";

    if (req.file) {
      const pdf = await pdfParse(req.file.buffer);
      text = pdf.text;
      sourceType = "pdf";
      fileName = req.file.originalname;
    }

    if (!text.trim()) return res.status(400).json({ error: "No text to summarize" });

    const prompt = `Summarize the following text concisely, highlighting key points with bullet points:\n\n${text.substring(0, 8000)}`;
    const summary = await callOllama(prompt);

    const saved = await Summary.create({ userId: req.user.id, originalText: text, summary, sourceType, fileName });
    res.json({ summary: saved.summary, id: saved._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
