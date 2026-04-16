const router = require("express").Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const PdfDocument = require("../models/PdfDocument");
const { callOllama } = require("../utils/ollama");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post("/upload", auth, upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    const pdf = await pdfParse(req.file.buffer);
    const text = pdf.text.substring(0, 15000);

    const summaryPrompt = `Summarize this educational document for a student. Include main topics and key takeaways:\n\n${text.substring(0, 8000)}`;
    const summary = await callOllama(summaryPrompt);

    const flashcardPrompt = `Create 5 flashcards from this text. Return ONLY JSON array: [{"question":"...","answer":"..."}]\n\n${text.substring(0, 6000)}`;
    const fcRaw = await callOllama(flashcardPrompt);
    const fcMatch = fcRaw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const flashcards = fcMatch ? JSON.parse(fcMatch[0]) : [];

    const topicPrompt = `List the 5 main topics from this text as a JSON array of strings: ["topic1","topic2",...]\n\n${text.substring(0, 4000)}`;
    const topicRaw = await callOllama(topicPrompt);
    const topicMatch = topicRaw.match(/\[[\s\S]*\]/);
    const keyTopics = topicMatch ? JSON.parse(topicMatch[0]) : [];

    const doc = await PdfDocument.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      extractedText: text,
      summary,
      flashcards,
      keyTopics,
    });

    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/documents", auth, async (req, res) => {
  try {
    const docs = await PdfDocument.find({ userId: req.user.id }).select("-extractedText").sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/ask", auth, async (req, res) => {
  try {
    const { documentId, question } = req.body;
    const doc = await PdfDocument.findById(documentId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const prompt = `Based on this document content, answer the question.\n\nDocument: ${doc.extractedText.substring(0, 6000)}\n\nQuestion: ${question}`;
    const answer = await callOllama(prompt);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
