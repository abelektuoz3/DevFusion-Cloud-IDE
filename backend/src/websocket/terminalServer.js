const WebSocket = require('ws');
const url = require('url');
const terminalManager = require('../services/terminal/terminalManager');

class TerminalWebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/api/terminal/ws' 
    });
    
    this.setupWebSocket();
    console.log('[WebSocket] Terminal WebSocket server initialized on path: /api/terminal/ws');
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      const queryParams = url.parse(req.url, true).query;
      const sessionId = queryParams.sessionId;

      if (!sessionId) {
        ws.close(1008, 'Session ID required');
        return;
      }

      const session = terminalManager.getSession(sessionId);
      if (!session) {
        ws.close(1008, 'Invalid session ID');
        return;
      }

      console.log(`[WebSocket] Client connected to session ${sessionId}`);

      // Send session info
      ws.send(JSON.stringify({
        type: 'info',
        sessionId: session.sessionId,
        workspaceId: session.workspaceId,
      }));

      // Handle PTY output
      session.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'output',
            data: data,
          }));
        }
      });

      // Handle PTY exit
      session.onExit((exitCode) => {
        ws.send(JSON.stringify({
          type: 'exit',
          code: exitCode.exitCode || 0,
          signal: exitCode.signal || null,
        }));
        ws.close();
      });

      // Handle WebSocket messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          switch (data.type) {
            case 'input':
              if (data.data) {
                session.write(data.data);
              }
              break;
              
            case 'resize':
              if (data.cols && data.rows) {
                session.resize(data.cols, data.rows);
              }
              break;
              
            default:
              console.warn(`[WebSocket] Unknown message type: ${data.type}`);
          }
        } catch (error) {
          console.error('[WebSocket] Error processing message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
          }));
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