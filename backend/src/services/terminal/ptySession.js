const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

class PTYSession {
  constructor(workspaceId, userId, cols = 120, rows = 30) {
    this.sessionId = uuidv4();
    this.workspaceId = workspaceId;
    this.userId = userId;
    this.cols = cols;
    this.rows = rows;
    this.process = null;
    this.isAlive = false;
    this.createdAt = Date.now();
    this.outputCallback = null;
    this.exitCallback = null;
  }

  start(workspacePath) {
    try {
      // Use PowerShell on Windows, bash on Linux/Mac
      const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/bash';
      
      console.log(`[PTY] Starting shell: ${shell} in ${workspacePath}`);
      
      this.process = spawn(shell, [], {
        cwd: workspacePath,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
        },
        windowsHide: false,
      });

      this.isAlive = true;

      // Handle stdout
      this.process.stdout.on('data', (data) => {
        if (this.outputCallback) {
          this.outputCallback(data.toString());
        }
      });

      // Handle stderr
      this.process.stderr.on('data', (data) => {
        if (this.outputCallback) {
          this.outputCallback(data.toString());
        }
      });

      // Handle exit
      this.process.on('exit', (code, signal) => {
        this.isAlive = false;
        console.log(`[PTY] Session ${this.sessionId} exited with code ${code}`);
        if (this.exitCallback) {
          this.exitCallback({ exitCode: code, signal });
        }
      });

      // Handle errors
      this.process.on('error', (error) => {
        console.error(`[PTY] Session ${this.sessionId} error:`, error);
        this.isAlive = false;
      });

      console.log(`[PTY] Session ${this.sessionId} started for workspace ${this.workspaceId}`);
      return this.process;
    } catch (error) {
      console.error('[PTY] Failed to start session:', error);
      throw error;
    }
  }

  write(data) {
    if (this.process && this.isAlive && this.process.stdin) {
      this.process.stdin.write(data);
    }
  }

  resize(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    // Note: Windows doesn't support dynamic resize via child_process
    // This is kept for compatibility
  }

  kill() {
    if (this.process && this.isAlive) {
      try {
        // On Windows, use taskkill for better cleanup
        if (process.platform === 'win32') {
          const { exec } = require('child_process');
          exec(`taskkill /pid ${this.process.pid} /T /F`, (error) => {
            if (error) {
              console.error('[PTY] Error killing process:', error);
            }
          });
        } else {
          this.process.kill('SIGTERM');
        }
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
      pid: this.process ? this.process.pid : null,
    };
  }
}

module.exports = PTYSession;