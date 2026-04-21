require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://ai-student-tutor-rko1qp872-brainyjustin12s-projects.vercel.app/",
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://brainyjustinhabakubaho_db_user:Tutor12345@cluster0.zpwme21.mongodb.net/ai-student-tutor?appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/generate-quiz", require("./routes/quiz"));
app.use("/api/summarize", require("./routes/summarize"));
app.use("/api/predict-performance", require("./routes/predict"));
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/pdf-learn", require("./routes/pdfLearn"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
