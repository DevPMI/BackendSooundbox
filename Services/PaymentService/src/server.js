const http = require('http');
const sequelize = require('./db'); // Ambil dari db.js
require('dotenv').config();
const inquiryHandler = require('./handlers/inquiryHandler');
const { logResponse } = require('./utils/logger');


const PORT = 3004;

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/inquiry')) {
    return inquiryHandler(req, res);
  }

  // Fallback route
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'fail', message: 'Route not found' }));
});

sequelize.authenticate()
  .then(() => {
    console.log('DB Connected');
    server.listen(PORT, () => {
      console.log(`Inquiry‑service running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    logResponse(500, 'Failed to connect to DB');
    console.error('Unable to connect to the database:', err);
  });
