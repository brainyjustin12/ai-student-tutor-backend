const router = require("express").Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const users = await User.find({ quizzesTaken: { $gt: 0 } })
      .select("name school country totalScore quizzesTaken avgScore avatar")
      .sort({ totalScore: -1 })
      .limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
