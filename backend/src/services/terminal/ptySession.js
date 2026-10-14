const pty = require("node-pty");
const { v4: uuidv4 } = require("uuid");

class PTYSession {
  constructor(
    workspaceId,
    userId,
    cols = 120,
    rows = 30,
    username = "user",
    workspaceName = "project",
  ) {
    this.sessionId = uuidv4();
    this.workspaceId = workspaceId;
    this.userId = userId;
    this.cols = cols;
    this.rows = rows;
    this.username = username || "user";
    this.workspaceName = workspaceName || "workspace";
    this.ptyProcess = null;
    this.isAlive = false;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.outputCallback = null;
    this.exitCallback = null;
  }

  start(workspacePath) {
    try {
      const isWin = process.platform === "win32";
      // Use bash (from Git for Windows) if available, otherwise fall back to powershell
      const shell = isWin ? "powershell.exe" : "bash";

      console.log(
        `[PTY] Starting shell: ${shell} in ${workspacePath} for user: ${this.username}`,
      );

      // Build environment for the shell
      const env = {
        ...process.env,
        TERM: "xterm-256color",
        COLORTERM: "truecolor",
        // Custom vars we can reference in the prompt
        DEVFUSION_USER: this.username,
        DEVFUSION_HOST: "DevFusion",
        DEVFUSION_WORKSPACE: this.workspaceName,
      };

      let spawnArgs = [];

      if (isWin) {
        // PowerShell: define a dynamic prompt function that uses Get-Location
        // This makes the prompt update automatically after every command (including cd)
        const psPrompt =
          `function prompt { ` +
          `$pwd = (Get-Location).Path; ` +
          `$home = $env:HOME; ` +
          `if ($home -and $pwd.StartsWith($home)) { ` +
          `  $display = '~' + $pwd.Substring($home.Length).Replace('\\\\','/'); ` +
          `} else { $display = $pwd.Replace('\\\\','/'); } ` +
          `Write-Host -NoNewline -ForegroundColor Green "$env:DEVFUSION_USER@$env:DEVFUSION_HOST"; ` +
          `Write-Host -NoNewline " "; ` +
          `Write-Host -NoNewline -ForegroundColor Magenta "MINGW64"; ` +
          `Write-Host -NoNewline " "; ` +
          `Write-Host -NoNewline -ForegroundColor Yellow $display; ` +
          `Write-Host -NoNewline " "; ` +
          `Write-Host -NoNewline -ForegroundColor Cyan "(main)"; ` +
          `Write-Host ""; ` +
          `return "$ " ` +
          `}`;

        // Execute the prompt definition at shell startup
        spawnArgs = ["-NoLogo", "-NoExit", "-Command", psPrompt];
      } else {
        // Bash: PS1 with \w so the working directory updates dynamically
        env.PS1 = `\\[\\033[1;32m\\]\\u@DevFusion\\[\\033[0m\\] \\[\\033[1;35m\\]MINGW64\\[\\033[0m\\] \\[\\033[1;33m\\]\\w\\[\\033[0m\\] \\[\\033[1;36m\\](main)\\[\\033[0m\\]\\n\\$ `;
        spawnArgs = ["-i"];
      }

      this.ptyProcess = pty.spawn(shell, spawnArgs, {
        name: "xterm-256color",
        cols: this.cols,
        rows: this.rows,
        cwd: workspacePath,
        env,
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
        console.log(
          `[PTY] Session ${this.sessionId} exited with code ${exitCode}`,
        );
        if (this.exitCallback) {
          this.exitCallback({ exitCode, signal });
        }
      });

      console.log(
        `[PTY] Session ${this.sessionId} started (pid: ${this.ptyProcess.pid}) for workspace ${this.workspaceId}`,
      );
      return this.ptyProcess;
    } catch (error) {
      console.error("[PTY] Failed to start session:", error);
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
        console.warn(
          `[PTY] Resize error for session ${this.sessionId}:`,
          err.message,
        );
      }
    }
  }

  kill() {
    if (this.ptyProcess && this.isAlive) {
      try {
        this.ptyProcess.kill();
      } catch (error) {
        console.error("[PTY] Error killing session:", error);
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
