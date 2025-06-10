const http = require('http');
const bcrypt = require('bcrypt');
const sequelize = require('./db');
const Device = require('./models/device');

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/register') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { id, time_register } = JSON.parse(body);
        const timestamp = Math.floor(Date.now() / 1000);

        if (!id || !time_register) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            status: 'fail',
            message: 'Missing id or time_register',
            midware_timestamp: timestamp,
            response_code: '400'
          }));
        }

        await sequelize.sync();

        const existing = await Device.findByPk(id);
        if (existing) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            status: 'fail',
            message: 'Device already registered',
            midware_timestamp: timestamp,
            response_code: '409'
          }));
        }

        const hash = await bcrypt.hash(time_register.toString(), 10);

        await Device.create({
          id,
          time_register,
          password: hash,
          status: true
        });

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'success',
          message: 'Device registered successfully',
          midware_timestamp: timestamp,
          response_code: '201'
        }));
      } catch (err) {
        console.error(err);
        const timestamp = Math.floor(Date.now() / 1000);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Server error',
          midware_timestamp: timestamp,
         response_code: '500'
        }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'error',
      message: 'Not found',
      midware_timestamp: Math.floor(Date.now() / 1000),
      response_code: '500'
    }));
  }
});

server.listen(PORT, () => {
  console.log(`Register service running on http://localhost:${PORT}`);
});
