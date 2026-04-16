const axios = require("axios");

const OLLAMA_URL = (process.env.OLLAMA_URL || "https://radiopaque-unpreached-tawana.ngrok-free.dev").trim();
const MODEL = process.env.OLLAMA_MODEL || "llama3";

async function callOllama(prompt, systemPrompt = "") {
  try {
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });

    const res = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: MODEL,
      messages,
      stream: false,
    });
    return res.data.message?.content || "";
  } catch (err) {
    console.error("Ollama error:", err.message);
    throw new Error("AI service unavailable. Make sure Ollama is running.");
  }
}

module.exports = { callOllama };
