const router = require("express").Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Quiz = require("../models/Quiz");

const uploadDir = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const recentQuizzes = await Quiz.find({ userId: req.user.id, completedAt: { $ne: null } }).sort({ completedAt: -1 }).limit(10);

    const topicStats = {};
    recentQuizzes.forEach(q => {
      if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0, count: 0 };
      topicStats[q.topic].total += q.totalQuestions;
      topicStats[q.topic].correct += q.score;
      topicStats[q.topic].count += 1;
    });

    res.json({ user, recentQuizzes, topicStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/", auth, upload.single("avatar"), async (req, res) => {
  try {
    const updates = {};
    ["name", "bio", "school", "grade", "country", "subjects"].forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = field === "subjects" ? JSON.parse(req.body[field]) : req.body[field];
      }
    });
    if (req.file) updates.avatar = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
