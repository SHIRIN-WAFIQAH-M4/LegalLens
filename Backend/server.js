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
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 🌐 test route
app.get("/", (req, res) => {
  res.send("Server running");
});

// 🚀 MAIN ROUTE (TXT ONLY)
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // 🔑 API key check
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "Missing Groq API key",
      });
    }

    // 📁 file check
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    // 📄 only allow txt files
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext !== ".txt") {
      return res.status(400).json({
        error: "Only .txt files are supported",
      });
    }

    console.log("📁 File:", req.file.originalname);

    const filePath = req.file.path;

    // 📄 read txt file
    let text = fs.readFileSync(filePath, "utf8");

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Empty file content",
      });
    }

    // ⚡ limit input size
    text = text.slice(0, 3000);

    const prompt = `
You are a legal assistant.

Return ONLY plain text.

Do NOT use markdown.
Do NOT use **.
Do NOT use bullet symbols.
Do NOT add extra headings.

Use exactly this format:

Summary:
Write a short summary here.

Key Points:
1. Point one
2. Point two
3. Point three
4. Point four
Risks:
1. Risk one
2. Risk two
3. Risk three
4. Risk four

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
        temperature: 0.2,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const output =
      response.data?.choices?.[0]?.message?.content || "";

    console.log("🤖 AI Output:");
    console.log(output);

    if (!output.trim()) {
      return res.status(500).json({
        error: "No AI output received",
      });
    }

    return res.json({
      result: output,
    });
  } catch (err) {
    console.error(
      "❌ FULL ERROR:",
      err.response?.data || err.message
    );

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
