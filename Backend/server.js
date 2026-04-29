const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// 📂 uploads folder
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 📦 multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// 🌐 test route
app.get("/", (req, res) => {
  res.send("Server running");
});

// 🚀 MAIN ROUTE
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // 🔑 API key check
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "Missing Groq API key in .env",
      });
    }

    // 📁 file check
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    console.log("📁 File:", req.file.originalname);

    // 📄 read file
    const filePath = req.file.path;
    let text = fs.readFileSync(filePath, "utf8");

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: "Empty file content",
      });
    }

    // ⚡ limit input size
    text = text.slice(0, 1500);

    const prompt = `
You are a legal assistant.

Analyze this legal document and return STRICTLY:

Summary:
- short summary

Key Points:
1. ...
2. ...

Risks:
1. ...
2. ...

Document:
${text}
`;

    // 🔥 GROQ API CALL
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ extract output
    const output = response.data?.choices?.[0]?.message?.content;

    if (!output) {
      return res.status(500).json({
        error: "No AI output received",
        debug: response.data,
      });
    }

    // ✅ success
    return res.json({ result: output });

  } catch (err) {
    console.error("❌ FULL ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      error: "AI processing failed",
      details: err.response?.data || err.message,
    });
  }
});

// 🚀 start server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});