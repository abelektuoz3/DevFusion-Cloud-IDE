const express = require("express");
const router = express.Router();
const path = require("path");
const terminalManager = require("../services/terminal/terminalManager");
const { syncWorkspaceToDisk } = require("../services/terminal/workspaceSync");
const {
  startWatching,
  stopWatching,
} = require("../services/terminal/workspaceWatcher");
const { protect } = require("../../middleware/auth");
const Workspace = require("../../models/Workspace");

// Create terminal session
router.post(
  "/api/workspaces/:workspaceId/terminal",
  protect,
  async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user ? req.user._id : null;
      const username = req.user ? req.user.username || "user" : "user";
      const { cols = 120, rows = 30 } = req.body;

      const workspace = await Workspace.findById(workspaceId);
      const workspaceName = workspace ? workspace.name : "workspace";

      const workspacePath = path.join(
        __dirname,
        "../../workspaces",
        workspaceId,
      );

      await syncWorkspaceToDisk(workspaceId, workspacePath);
      startWatching(workspaceId, workspacePath, userId);

      const session = terminalManager.createSession(
        workspaceId,
        userId ? userId.toString() : "anonymous",
        workspacePath,
        cols,
        rows,
        username,
        workspaceName,
      );

      res.status(201).json({
        success: true,
        sessionId: session.sessionId,
        workspaceId: session.workspaceId,
        wsUrl: `/api/terminal/ws?sessionId=${session.sessionId}`,
        sessionInfo: session.getSessionInfo(),
      });
    } catch (error) {
      console.error("[API] Error creating terminal:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create terminal session",
        message: error.message,
      });
    }
  },
);

// Get terminal sessions for workspace
router.get(
  "/api/workspaces/:workspaceId/terminal",
  protect,
  async (req, res) => {
    try {
      const { workspaceId } = req.params;
      const sessions = terminalManager.getWorkspaceSessions(workspaceId);
      res.json({ success: true, sessions });
    } catch (error) {
      console.error("[API] Error getting terminals:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to get terminal sessions" });
    }
  },
);

// Close terminal session
router.delete("/api/terminal/:sessionId", protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = terminalManager.getSession(sessionId);
    const workspaceId = session ? session.workspaceId : null;

    const closed = terminalManager.closeSession(sessionId);

    if (closed && workspaceId) {
      const remaining = terminalManager.getWorkspaceSessions(workspaceId);
      if (remaining.length === 0) {
        stopWatching(workspaceId);
      }
      return res.json({ success: true, message: "Session closed" });
    }

    res.status(404).json({ success: false, error: "Session not found" });
  } catch (error) {
    console.error("[API] Error closing terminal:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to close terminal session" });
  }
});

module.exports = router;
