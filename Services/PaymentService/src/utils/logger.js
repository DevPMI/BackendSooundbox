// src/utils/logger.js
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logFile = path.join(logDir, 'service.log');

function write(type, msg) {
  const line = `[${new Date().toISOString()}] [${type.toUpperCase()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(line.trim());
}

module.exports = {
  logRequest: (req, body) =>
    write('request', `${req.method} ${req.url} | ${body}`),
  logResponse: (code, message) =>
    write('response', `Status: ${code} | Message: ${message}`),
  logError: (err) =>
    write('error', err.stack || err.toString()),
};
