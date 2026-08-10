const pty = require('node-pty');
const { v4: uuidv4 } = require('uuid');

class PTYSession {
  constructor(workspaceId, userId, cols = 120, rows = 30) {
    this.sessionId = uuidv4();
    this.workspaceId = workspaceId;
    this.userId = userId;
    this.cols = cols;
    this.rows = rows;
    this.ptyProcess = null;
    this.isAlive = false;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.outputCallback = null;
    this.exitCallback = null;
  }

  start(workspacePath) {
    try {
      // bash on Linux/Mac (Render runs Linux), powershell on Windows (local dev)
      const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';

      console.log(`[PTY] Starting shell: ${shell} in ${workspacePath}`);

      this.ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-256color',
        cols: this.cols,
        rows: this.rows,
        cwd: workspacePath,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          // Force interactive mode prompts
          PS1: '\\u@devfusion:\\w\\$ ',
        },
      });

      this.isAlive = true;

      // node-pty fires a single onData event for all output (stdout + stderr merged via PTY)
      this.ptyProcess.onData((data) => {
        this.lastActivity = Date.now();
        if (this.outputCallback) {
          this.outputCallback(data);
        }
      });

      this.ptyProcess.onExit(({ exitCode, signal }) => {
        this.isAlive = false;
        console.log(`[PTY] Session ${this.sessionId} exited with code ${exitCode}`);
        if (this.exitCallback) {
          this.exitCallback({ exitCode, signal });
        }
      });

      console.log(`[PTY] Session ${this.sessionId} started (pid: ${this.ptyProcess.pid}) for workspace ${this.workspaceId}`);
      return this.ptyProcess;
    } catch (error) {
      console.error('[PTY] Failed to start session:', error);
      throw error;
    }
  }

  write(data) {
    if (this.ptyProcess && this.isAlive) {
      this.lastActivity = Date.now();
      this.ptyProcess.write(data);
    }
  }

  resize(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    if (this.ptyProcess && this.isAlive) {
      try {
        this.ptyProcess.resize(cols, rows);
      } catch (err) {
        console.warn(`[PTY] Resize error for session ${this.sessionId}:`, err.message);
      }
    }
  }

  kill() {
    if (this.ptyProcess && this.isAlive) {
      try {
        this.ptyProcess.kill();
      } catch (error) {
        console.error('[PTY] Error killing session:', error);
      }
      this.isAlive = false;
      console.log(`[PTY] Session ${this.sessionId} killed`);
    }
  }

  onData(callback) {
    this.outputCallback = callback;
  }

  onExit(callback) {
    this.exitCallback = callback;
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      workspaceId: this.workspaceId,
      userId: this.userId,
      isAlive: this.isAlive,
      cols: this.cols,
      rows: this.rows,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      pid: this.ptyProcess ? this.ptyProcess.pid : null,
    };
  }
}

module.exports = PTYSession;