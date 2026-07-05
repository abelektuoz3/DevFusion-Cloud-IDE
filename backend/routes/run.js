// routes/run.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { protect } = require("../middleware/auth");

// Language mapping to Piston language names
const LANGUAGE_MAP = {
  javascript: "node",
  python: "python",
  java: "java",
  cpp: "gcc",
  csharp: "dotnet",
};

// @desc    Execute code using Piston
// @route   POST /api/run
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { language, code, stdin } = req.body;

    // Validate language
    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({
        error: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(", ")}`,
      });
    }

    // Validate code
    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        error: "Code cannot be empty",
      });
    }

    const pistonLanguage = LANGUAGE_MAP[language];

    // Get Piston URL from environment or use default
    const PISTON_URL = process.env.PISTON_URL || "http://localhost:2000";

    const payload = {
      language: pistonLanguage,
      version: "*",
      files: [{ content: code }],
      stdin: stdin || "",
    };

    // Try Piston first
    let response;
    try {
      response = await axios.post(`${PISTON_URL}/api/v2/execute`, payload, {
        timeout: 30000,
        headers: { "Content-Type": "application/json" },
      });
    } catch (pistonError) {
      console.log(
        "⚠️ Piston unavailable, using fallback:",
        pistonError.message,
      );

      return res.status(503).json({
        output: "",
        error:
          "Code execution service is currently unavailable. Please try again later.",
        details:
          "The execution engine is not responding. This is a temporary issue.",
        success: false,
      });
    }

    const result = response.data.run;

    let outputText = result.stdout || result.output || "";
    if (!outputText && result.stderr) {
      outputText = result.stderr;
    }

    outputText = outputText.trim();

    res.json({
      output: outputText || "No output",
      error: result.stderr || null,
      exitCode: result.code || 0,
      executionTime: result.time || 0,
      language: language,
      success: result.code === 0,
    });
  } catch (error) {
    console.error("Code execution error:", error);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        error: "Execution timed out.",
      });
    }

    if (error.response) {
      return res.status(error.response.status || 500).json({
        error: error.response.data?.message || "Execution service error",
        details: error.response.data,
      });
    }

    res.status(500).json({
      error: "Failed to execute code.",
      details: error.message,
    });
  }
});

module.exports = router;
