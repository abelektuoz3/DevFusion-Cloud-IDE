const WebSocket = require('ws');
const { verifyToken } = require('../../config/jwt');
const terminalManager = require('../services/terminal/terminalManager');

class TerminalWebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/api/terminal/ws',
    });

    this.setupWebSocket();
    console.log('[WebSocket] Terminal WebSocket server initialized on path: /api/terminal/ws');
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      // Parse query parameters using WHATWG URL API
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      const sessionId = parsedUrl.searchParams.get('sessionId');
      const token = parsedUrl.searchParams.get('token');

      // --- Auth: verify JWT token ---
      if (!token) {
        console.log('[WebSocket] ❌ No token provided');
        ws.close(1008, 'Authentication required');
        return;
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        console.log('[WebSocket] ❌ Invalid or expired token');
        ws.close(1008, 'Invalid token');
        return;
      }

      // --- Validate session ---
      if (!sessionId) {
        ws.close(1008, 'Session ID required');
        return;
      }

      const session = terminalManager.getSession(sessionId);
      if (!session) {
        ws.close(1008, 'Invalid session ID');
        return;
      }

      console.log(`[WebSocket] ✅ Client (userId: ${decoded.userId}) connected to session ${sessionId}`);

      // Send session info to client
      ws.send(JSON.stringify({
        type: 'info',
        sessionId: session.sessionId,
        workspaceId: session.workspaceId,
      }));

      // Pipe PTY output → WebSocket
      session.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'output',
            data: data,
          }));
        }
      });

      // Pipe PTY exit → WebSocket
      session.onExit(({ exitCode, signal }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'exit',
            code: exitCode || 0,
            signal: signal || null,
          }));
          ws.close();
        }
      });

      // Pipe WebSocket input → PTY
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);

          switch (data.type) {
            case 'input':
              if (data.data !== undefined) {
                session.write(data.data);
              }
              break;

            case 'resize':
              if (data.cols && data.rows) {
                session.resize(parseInt(data.cols), parseInt(data.rows));
              }
              break;

            default:
              console.warn(`[WebSocket] Unknown message type: ${data.type}`);
          }
        } catch (error) {
          console.error('[WebSocket] Error processing message:', error);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Invalid message format',
            }));
          }
        }
      });

      ws.on('close', () => {
        console.log(`[WebSocket] Client disconnected from session ${sessionId}`);
      });

      ws.on('error', (error) => {
        console.error(`[WebSocket] Error on session ${sessionId}:`, error);
      });
    });
  }

  close() {
    this.wss.close();
  }
}

module.exports = TerminalWebSocketServer;