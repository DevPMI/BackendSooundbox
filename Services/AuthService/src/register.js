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

        if (!id || !time_register) {
          res.writeHead(400);
          return res.end('Missing id or time_register');
        }

        await sequelize.sync();
        console.log("Synced DB")

        const existing = await Device.findByPk(id);
        if (existing) {
          res.writeHead(200);
          return res.end('Device already registered');
        }

        const hash = await bcrypt.hash(time_register.toString(), 10);

        await Device.create({
          id,
          time_register,
          password: hash,
          status: true
        });

        res.writeHead(201);
        res.end('Device registered successfully');
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end('Server error');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Register service running on http://localhost:${PORT}`);
});
