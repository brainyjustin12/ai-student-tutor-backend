require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Quiz = require("./models/Quiz");
const ChatHistory = require("./models/ChatHistory");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://brainyjustinhabakubaho_db_user:aBQJBXjuqvDWTRJY@cluster0.zpwme21.mongodb.net/ai-student-tutor?appName=Cluster0");
  console.log("Connected to MongoDB");

  await User.deleteMany({});
  await Quiz.deleteMany({});
  await ChatHistory.deleteMany({});

  const password = await bcrypt.hash("password123", 10);

  const students = [
    { name: "Amina Uwase", email: "amina@test.com", password, school: "Green Hills Academy", grade: "S4", country: "Rwanda", subjects: ["Mathematics", "Physics"], totalScore: 42, quizzesTaken: 5, avgScore: 8.4, streak: 3 },
    { name: "Jean Habimana", email: "jean@test.com", password, school: "Riviera High", grade: "S5", country: "Rwanda", subjects: ["Biology", "Chemistry"], totalScore: 38, quizzesTaken: 5, avgScore: 7.6, streak: 5 },
    { name: "Fatima Nkusi", email: "fatima@test.com", password, school: "King David Academy", grade: "S3", country: "Rwanda", subjects: ["English", "History"], totalScore: 35, quizzesTaken: 4, avgScore: 8.75, streak: 2 },
    { name: "David Mugisha", email: "david@test.com", password, school: "Lycee de Kigali", grade: "S6", country: "Rwanda", subjects: ["Computer Science", "Mathematics"], totalScore: 45, quizzesTaken: 5, avgScore: 9.0, streak: 7 },
    { name: "Grace Ishimwe", email: "grace@test.com", password, school: "FAWE Girls", grade: "S4", country: "Rwanda", subjects: ["Geography", "Economics"], totalScore: 30, quizzesTaken: 4, avgScore: 7.5, streak: 1 },
  ];

  const users = await User.insertMany(students);
  console.log(`Seeded ${users.length} students`);

  const topics = ["Mathematics", "Biology", "Physics", "Chemistry", "History"];
  for (const user of users) {
    for (let i = 0; i < 3; i++) {
      await Quiz.create({
        userId: user._id,
        topic: topics[Math.floor(Math.random() * topics.length)],
        questions: [
          { question: "Sample question?", options: ["A", "B", "C", "D"], correctAnswer: 0, explanation: "Explanation" },
        ],
        score: Math.floor(Math.random() * 5) + 5,
        totalQuestions: 10,
        completedAt: new Date(Date.now() - Math.random() * 7 * 86400000),
      });
    }
  }

  console.log("Seeded quizzes");
  console.log("\nTest credentials: any email above / password123");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
