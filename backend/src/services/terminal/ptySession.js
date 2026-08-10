const pty = require('node-pty');
const { v4: uuidv4 } = require('uuid');

class PTYSession {
  constructor(workspaceId, userId, cols = 120, rows = 30, username = 'user', workspaceName = 'project') {
    this.sessionId = uuidv4();
    this.workspaceId = workspaceId;
    this.userId = userId;
    this.cols = cols;
    this.rows = rows;
    this.username = username || 'user';
    this.workspaceName = workspaceName || 'workspace';
    this.ptyProcess = null;
    this.isAlive = false;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.outputCallback = null;
    this.exitCallback = null;
  }

  start(workspacePath) {
    try {
      const isWin = process.platform === 'win32';
      const shell = isWin ? 'powershell.exe' : 'bash';

      console.log(`[PTY] Starting shell: ${shell} in ${workspacePath} for user: ${this.username}`);

      // Git Bash / Antigravity styled PS1 prompt:
      // user@DevFusion MINGW64 ~/workspaceName (main)
      // $ 
      const displayUser = this.username;
      const displayHost = 'DevFusion';
      
      const ps1Prompt = `\\[\\033[1;32m\\]${displayUser}@${displayHost}\\[\\033[0m\\] \\[\\033[1;35m\\]MINGW64\\[\\033[0m\\] \\[\\033[1;33m\\]~/${this.workspaceName}\\[\\033[0m\\] \\[\\033[1;36m\\](main)\\[\\033[0m\\]\\n\\$ `;

      const spawnArgs = isWin ? [] : ['-i'];

      this.ptyProcess = pty.spawn(shell, spawnArgs, {
        name: 'xterm-256color',
        cols: this.cols,
        rows: this.rows,
        cwd: workspacePath,
        env: {
          ...process.env,
          HOME: workspacePath,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          PS1: ps1Prompt,
          PROMPT_COMMAND: `export PS1="${ps1Prompt}"`,
        },
      });

      this.isAlive = true;

      // Handle output data
      this.ptyProcess.onData((data) => {
        this.lastActivity = Date.now();
        if (this.outputCallback) {
          this.outputCallback(data);
        }
      });

      // Handle session exit
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
      username: this.username,
      workspaceName: this.workspaceName,
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