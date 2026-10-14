const pty = require("node-pty");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

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

      // Find bash: on Windows, prefer Git Bash; on Linux/Mac, use system bash
      let shell;
      let shellArgs;

      if (isWin) {
        const gitBashPaths = [
          "C:\\Program Files\\Git\\bin\\bash.exe",
          "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
          process.env.ProgramFiles ?
            path.join(process.env.ProgramFiles, "Git", "bin", "bash.exe")
          : null,
        ].filter(Boolean);

        shell = gitBashPaths.find((p) => fs.existsSync(p)) || "bash.exe";
        shellArgs = ["--login", "-i"];
      } else {
        shell = "/bin/bash";
        shellArgs = ["--login", "-i"];
      }

      console.log(
        `[PTY] Starting shell: ${shell} in ${workspacePath} for user: ${this.username}`,
      );

      // Escape username for safe use in bash prompt
      const safeUser = this.username.replace(/[^a-zA-Z0-9_-]/g, "");

      // VS Code / Git Bash style prompt:
      //   abel@DevFusion MINGW64 ~/m (main)
      //   $
      // Note: __git_ps1 is only available in Git Bash — we define a fallback
      // that shows "(main)" if the folder is a git repo, otherwise nothing.
      const ps1 = [
        "\\[\\e[1;32m\\]" + safeUser + "@DevFusion\\[\\e[0m\\]",
        "\\[\\e[1;35m\\]MINGW64\\[\\e[0m\\]",
        "\\[\\e[1;33m\\]\\w\\[\\e[0m\\]",
        "\\[\\e[1;36m\\]$(__devfusion_git_branch)\\[\\e[0m\\]",
        "\\n\\$ ",
      ].join(" ");

      // Define a portable git-branch helper (works even without __git_ps1)
      const gitHelper = `
__devfusion_git_branch() {
  if [ -d .git ] || git rev-parse --git-dir > /dev/null 2>&1; then
    local branch=$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)
    if [ -n "$branch" ]; then
      echo " ($branch)"
    fi
  fi
}
export -f __devfusion_git_branch 2>/dev/null || true
`;

      const env = {
        ...process.env,
        HOME: workspacePath,
        TERM: "xterm-256color",
        COLORTERM: "truecolor",
        PS1: ps1,
        PROMPT_COMMAND: `export PS1='${ps1}'`,
        // Force the username in the shell — overrides system $USER
        USER: safeUser,
        LOGNAME: safeUser,
        // Also inject a var we can reference if needed
        DEVFUSION_USER: safeUser,
        MSYSTEM: "MINGW64",
      };

      this.ptyProcess = pty.spawn(shell, shellArgs, {
        name: "xterm-256color",
        cols: this.cols,
        rows: this.rows,
        cwd: workspacePath,
        env,
      });

      this.isAlive = true;

      // Inject the git helper right after bash starts
      // (env vars don't define shell functions, so we send it as input)
      setTimeout(() => {
        if (this.ptyProcess && this.isAlive) {
          this.ptyProcess.write(gitHelper + "\n");
        }
      }, 300);

      this.ptyProcess.onData((data) => {
        this.lastActivity = Date.now();
        if (this.outputCallback) {
          this.outputCallback(data);
        }
      });

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
