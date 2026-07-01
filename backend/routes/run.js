const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/auth");

// Language mapping to Piston language names (from /runtimes)
const LANGUAGE_MAP = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "c++",
  csharp: "csharp.net", // C# runtime
};

// @desc    Execute code using Piston
// @route   POST /api/run
// @access  Private
router.post("/", auth, async (req, res) => {
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

    const payload = {
      language: pistonLanguage,
      version: "*",
      files: [{ content: code }],
      stdin: stdin || "",
      // ❌ DO NOT add compile_timeout or run_timeout - they exceed the limit
    };

    const response = await axios.post(
      "http://localhost:2000/api/v2/execute",
      payload,
      {
        timeout: 30000, // 30 seconds for the entire request
        headers: { "Content-Type": "application/json" },
      },
    );

    const result = response.data.run;

    // For C#, output might be in stdout or stderr
    let outputText = result.stdout || result.output || "";

    // If stdout is empty but stderr has content, use stderr (some .NET apps output to stderr)
    if (!outputText && result.stderr) {
      outputText = result.stderr;
    }

    // Clean up the output
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
      // Check if it's a timeout from Piston
      if (error.response.data?.message?.includes("Time limit exceeded")) {
        return res.status(504).json({
          error: "C# compilation timed out. Try again or use simpler code.",
        });
      }
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
