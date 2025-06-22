const http = require('http');
const { sequelize } = require('./db'); // import sequelize dari db.js
const createQRHandler = require('./handlers/createQRHandler');
const { logRequest, logResponse } = require('./utils/logger');

const PORT = 3007;
// sinkronisasi tabel ke database
sequelize.sync()
  .then(() => {
    console.log('Database connected & synced');
    server.listen(PORT, () => {
      console.log(`QRService running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
  });

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/create-qr') {
    return createQRHandler(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'fail', message: 'Route not found' }));
});


