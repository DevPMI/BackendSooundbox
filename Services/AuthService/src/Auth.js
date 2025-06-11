const http = require('http');
const bcrypt = require('bcrypt');
const sequelize = require('./db');
const Device = require('./models/device');

const PORT = 3000;

// Sync DB sebelum server jalan
sequelize.sync().then(() => {
  console.log('DB Connected');
});

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/register') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { id, time_register } = JSON.parse(body);

        if (!id || !time_register) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            status: 'fail',
            message: 'Missing id or time_register',
            midware_timestamp: Math.floor(Date.now() / 1000),
            response_code: '400'
          }));
        }

        // Cek apakah device sudah terdaftar
        const existing = await Device.findByPk(id);
        if (existing) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            status: 'fail',
            message: 'Device already registered',
            midware_timestamp: Math.floor(Date.now() / 1000),
            response_code: '409'
          }));
        }

        // Konversi time_register ke Date object (asumsinya detik)
        const dateObj = new Date(time_register * 1000);

        // Hash time_register untuk disimpan sebagai password
        const hash = await bcrypt.hash(time_register.toString(), 10);

        // Simpan ke DB
        await Device.create({
          id,
          time_register: dateObj,
          password: hash,
          status: true
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          message: 'Device registered successfully',
          midware_timestamp: Math.floor(Date.now() / 1000),
          response_code: '201'
        }));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Server error',
          midware_timestamp: Math.floor(Date.now() / 1000),
          response_code: '500'
        }));
      }
    });

  } else if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { id, time_register } = JSON.parse(body);

        if (!id || !time_register) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            status: 'fail',
            message: 'Missing id or time_register',
            midware_timestamp: Math.floor(Date.now() / 1000),
            response_code: '400'
          }));
        }

        const device = await Device.findByPk(id);
        if (!device) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            status: 'fail',
            message: 'Device not found',
            midware_timestamp: Math.floor(Date.now() / 1000),
            response_code: '404'
          }));
        }

        const match = await bcrypt.compare(time_register.toString(), device.password);
        if (!match) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            status: 'fail',
            message: 'Invalid credentials',
            midware_timestamp: Math.floor(Date.now() / 1000),
            response_code: '401'
          }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          message: 'Login successful',
          midware_timestamp: Math.floor(Date.now() / 1000),
          token: 'mocked-token'
        }));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Server error',
          midware_timestamp: Math.floor(Date.now() / 1000),
          response_code: '500'
        }));
      }
    });

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'fail',
      message: 'Endpoint not found',
      midware_timestamp: Math.floor(Date.now() / 1000),
      response_code: '404'
    }));
  }
});

server.listen(PORT, () => {
  console.log(`Auth service (register & login) running on http://localhost:${PORT}`);
});
