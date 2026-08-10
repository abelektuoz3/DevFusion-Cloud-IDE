const express = require('express');
const router = express.Router();
const terminalManager = require('../services/terminal/terminalManager');
const { protect } = require('../../middleware/auth');
const fs = require('fs');
const path = require('path');

// Create terminal session
router.post('/api/workspaces/:workspaceId/terminal', protect, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user?.id || 'anonymous';
    const { cols = 120, rows = 30 } = req.body;

    // Create workspace directory if it doesn't exist
    const workspacePath = path.join(__dirname, '../../workspaces', workspaceId);
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
      // Create a test file
      fs.writeFileSync(path.join(workspacePath, 'README.md'), `# Workspace ${workspaceId}\n\nCreated at: ${new Date().toISOString()}`);
    }

    const session = terminalManager.createSession(
      workspaceId,
      userId,
      workspacePath,
      cols,
      rows
    );

    res.status(201).json({
      success: true,
      sessionId: session.sessionId,
      workspaceId: session.workspaceId,
      wsUrl: `/api/terminal/ws?sessionId=${session.sessionId}`,
      sessionInfo: session.getSessionInfo(),
    });
  } catch (error) {
    console.error('[API] Error creating terminal:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create terminal session',
      message: error.message 
    });
  }
});

// Get terminal sessions for workspace
router.get('/api/workspaces/:workspaceId/terminal', protect, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const sessions = terminalManager.getWorkspaceSessions(workspaceId);
    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('[API] Error getting terminals:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get terminal sessions' 
    });
  }
});

// Close terminal session
router.delete('/api/terminal/:sessionId', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const closed = terminalManager.closeSession(sessionId);
    
    if (closed) {
      res.json({ 
        success: true, 
        message: 'Session closed' 
      });
    } else {
      res.status(404).json({ 
        success: false,
        error: 'Session not found' 
      });
    }
  } catch (error) {
    console.error('[API] Error closing terminal:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to close terminal session' 
    });
  }
});

module.exports = router;