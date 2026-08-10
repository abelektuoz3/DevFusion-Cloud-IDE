const PTYSession = require('./ptySession');

class TerminalManager {
  constructor() {
    this.sessions = new Map();
    this.workspaceSessions = new Map();
  }

  createSession(workspaceId, userId, workspacePath, cols = 120, rows = 30, username = 'user', workspaceName = 'workspace') {
    // Create workspace session tracking if not exists
    if (!this.workspaceSessions.has(workspaceId)) {
      this.workspaceSessions.set(workspaceId, new Set());
    }

    // Create new PTY session
    const session = new PTYSession(workspaceId, userId, cols, rows, username, workspaceName);
    session.start(workspacePath);

    // Store session
    this.sessions.set(session.sessionId, session);
    this.workspaceSessions.get(workspaceId).add(session.sessionId);

    console.log(`[TerminalManager] Created session ${session.sessionId} for workspace ${workspaceId}`);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  closeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.kill();
      
      // Remove from workspace sessions
      const workspaceId = session.workspaceId;
      const sessions = this.workspaceSessions.get(workspaceId);
      if (sessions) {
        sessions.delete(sessionId);
        if (sessions.size === 0) {
          this.workspaceSessions.delete(workspaceId);
        }
      }

      this.sessions.delete(sessionId);
      console.log(`[TerminalManager] Session ${sessionId} closed`);
      return true;
    }
    return false;
  }

  closeAllSessionsForWorkspace(workspaceId) {
    const sessions = this.workspaceSessions.get(workspaceId);
    if (sessions) {
      for (const sessionId of sessions) {
        this.closeSession(sessionId);
      }
      return true;
    }
    return false;
  }

  getWorkspaceSessions(workspaceId) {
    const sessionIds = this.workspaceSessions.get(workspaceId);
    if (!sessionIds) return [];
    
    const sessions = [];
    for (const sessionId of sessionIds) {
      const session = this.sessions.get(sessionId);
      if (session) {
        sessions.push(session.getSessionInfo());
      }
    }
    return sessions;
  }

  cleanupIdleSessions(maxIdleTime = 30 * 60 * 1000) { // 30 minutes default
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions) {
      const lastSeen = session.lastActivity || session.createdAt;
      if (now - lastSeen > maxIdleTime) {
        this.closeSession(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }
}

module.exports = new TerminalManager();