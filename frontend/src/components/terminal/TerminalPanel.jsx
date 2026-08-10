import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

export const TerminalPanel = ({ workspaceId }) => {
  const terminalRef = useRef(null);
  const [terminal, setTerminal] = useState(null);
  const [fitAddon] = useState(() => new FitAddon());
  const wsRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
      },
      rows: 30,
      cols: 120,
    });

    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln('\x1b[1;32mDevFusion Terminal v3.0\x1b[0m');
    term.writeln('\x1b[1;33mInitializing...\x1b[0m');

    setTerminal(term);

    const handleResize = () => {
      fitAddon.fit();
      const dims = fitAddon.proposeDimensions();
      if (dims && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'resize',
          cols: dims.cols,
          rows: dims.rows,
        }));
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      term.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Connect to WebSocket and handle I/O
  useEffect(() => {
    if (!terminal) return;

    const initializeTerminal = async () => {
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          terminal.writeln('\x1b[1;31m× No authentication token found. Please login again.\x1b[0m');
          return;
        }

        // Get the backend URL from environment or use default
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        // Create terminal session with authentication
        const response = await fetch(`${backendUrl}/api/workspaces/${workspaceId}/terminal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ cols: 120, rows: 30 }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSessionId(data.sessionId);

        // Connect WebSocket with token as query parameter
        const wsUrl = `${backendUrl.replace('http', 'ws')}/api/terminal/ws?sessionId=${data.sessionId}&token=${token}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          terminal.writeln('\x1b[1;32m✓ Connected to terminal\x1b[0m');
          terminal.writeln('\x1b[1;33mType commands to begin...\x1b[0m');
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            
            if (msg.type === 'output') {
              terminal.write(msg.data);
            } else if (msg.type === 'exit') {
              terminal.writeln(`\r\n\x1b[1;33mProcess exited with code ${msg.code}\x1b[0m`);
            } else if (msg.type === 'info') {
              terminal.writeln(`\x1b[1;34mSession: ${msg.sessionId}\x1b[0m`);
            } else if (msg.type === 'error') {
              terminal.writeln(`\r\n\x1b[1;31mError: ${msg.message}\x1b[0m`);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          terminal.writeln('\x1b[1;31m× Disconnected from terminal\x1b[0m');
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          terminal.writeln('\x1b[1;31m× WebSocket error occurred\x1b[0m');
        };

        // Handle terminal input
        terminal.onData((data) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'input', data }));
          }
        });

      } catch (error) {
        console.error('Failed to initialize terminal:', error);
        terminal.writeln('\x1b[1;31m× Failed to connect to terminal\x1b[0m');
        terminal.writeln(`\x1b[1;31mError: ${error.message}\x1b[0m`);
      }
    };

    initializeTerminal();

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (sessionId) {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        fetch(`${backendUrl}/api/terminal/${sessionId}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }).catch(console.error);
      }
    };
  }, [terminal, workspaceId]);

  return (
    <div 
      ref={terminalRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '300px',
        backgroundColor: '#1e1e1e',
        padding: '10px'
      }} 
    />
  );
};