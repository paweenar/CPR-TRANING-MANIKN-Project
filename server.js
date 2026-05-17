/**
 * CPR Trainer Monitoring System — Backend Server v3.0 (Refactored)
 */
require('dotenv').config();

const http = require('http');
const app = require('./app');

const SerialService = require('./services/serial.service');
const WebSocketService = require('./services/websocket.service');

const COM_PORT  = process.env.COM_PORT  || 'COM3';
const BAUD_RATE = parseInt(process.env.BAUD_RATE) || 115200;
const PORT      = parseInt(process.env.PORT) || 3000;

const server = http.createServer(app);

// Initialize Services
const serialService = new SerialService(COM_PORT, BAUD_RATE);
const websocketService = new WebSocketService(server, serialService);

// Start Serial Connection
serialService.connect();

server.listen(PORT, () => {
  console.log('\n====================================');
  console.log(' CPR Trainer Backend Server v3.0');
  console.log('====================================');
  console.log(` URL    : http://localhost:${PORT}`);
  console.log(` Serial : ${COM_PORT} @ ${BAUD_RATE} baud`);
  console.log('------------------------------------');
  console.log(' 🌐 Open: http://localhost:' + PORT + '/login.html\n');
});
