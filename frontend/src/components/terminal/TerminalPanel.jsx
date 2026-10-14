import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import "xterm/css/xterm.css";

export const TerminalPanel = ({ workspaceId }) => {
  const terminalRef = useRef(null);
  const [terminal, setTerminal] = useState(null);
  const [fitAddon] = useState(() => new FitAddon());
  const wsRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "monospace",
      theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        cursor: "#ffffff",
      },
      rows: 30,
      cols: 120,
    });

    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln("\x1b[1;32mDevFusion Terminal v3.0\x1b[0m");
    term.writeln("\x1b[1;33mInitializing...\x1b[0m");

    setTerminal(term);

    const handleResize = () => {
      fitAddon.fit();
      const dims = fitAddon.proposeDimensions();
      if (dims && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "resize",
            cols: dims.cols,
            rows: dims.rows,
          }),
        );
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      term.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!terminal) return;

    const initializeTerminal = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          terminal.writeln(
            "\x1b[1;31m× No authentication token found. Please login again.\x1b[0m",
          );
          return;
        }

        const backendUrl =
          import.meta.env.VITE_BACKEND_URL ||
          import.meta.env.VITE_API_URL ||
          "http://localhost:5000";

        const response = await fetch(
          `${backendUrl}/api/workspaces/${workspaceId}/terminal`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ cols: 120, rows: 30 }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();
        setSessionId(data.sessionId);

        const wsUrl = `${backendUrl.replace("http", "ws")}/api/terminal/ws?sessionId=${data.sessionId}&token=${token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          terminal.writeln("\x1b[1;32m✓ Connected to terminal\x1b[0m");
          terminal.writeln("\x1b[1;33mType commands to begin...\x1b[0m");
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === "output") {
              terminal.write(msg.data);
            } else if (msg.type === "exit") {
              terminal.writeln(
                `\r\n\x1b[1;33mProcess exited with code ${msg.code}\x1b[0m`,
              );
            } else if (msg.type === "info") {
              terminal.writeln(`\x1b[1;34mSession: ${msg.sessionId}\x1b[0m`);
            } else if (msg.type === "error") {
              terminal.writeln(`\r\n\x1b[1;31mError: ${msg.message}\x1b[0m`);
            } else if (msg.type === "fs-change") {
              // Notify any component listening for workspace file changes
              window.dispatchEvent(
                new CustomEvent("workspace-fs-change", { detail: msg }),
              );
            }
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        };

        ws.onclose = () => {
          terminal.writeln("\x1b[1;31m× Disconnected from terminal\x1b[0m");
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          terminal.writeln("\x1b[1;31m× WebSocket error occurred\x1b[0m");
        };

        terminal.onData((data) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "input", data }));
          }
        });
      } catch (error) {
        console.error("Failed to initialize terminal:", error);
        terminal.writeln("\x1b[1;31m× Failed to connect to terminal\x1b[0m");
        terminal.writeln(`\x1b[1;31mError: ${error.message}\x1b[0m`);
      }
    };

    initializeTerminal();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (sessionId) {
        const token = localStorage.getItem("token");
        const backendUrl =
          import.meta.env.VITE_BACKEND_URL ||
          import.meta.env.VITE_API_URL ||
          "http://localhost:5000";

        fetch(`${backendUrl}/api/terminal/${sessionId}`, {
          method: "DELETE",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }).catch(console.error);
      }
    };
  }, [terminal, workspaceId]);

  return (
    <div
      ref={terminalRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "300px",
        backgroundColor: "#1e1e1e",
        padding: "10px",
      }}
    />
  );
};
