const http = require('http');
const bcrypt = require('bcrypt');
const sequelize = require('./db');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'rahasia';
const { Device } = require('../models');
const verifyToken = require('./authMiddleware');

const PORT = process.env.PORT;

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/register') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { id, time_register } = JSON.parse(body);

        if (!id || !time_register) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(
            JSON.stringify({
              status: 'fail',
              message: 'Missing id or time_register',
              midware_timestamp: Math.floor(Date.now() / 1000),
              response_code: '400',
            }));
        }

        await sequelize.sync();
        const existing = await Device.findByPk(id);
        if (existing) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(
            JSON.stringify({
              status: 'fail',
              message: 'Device already registered',
              midware_timestamp: Math.floor(Date.now() / 1000),
              response_code: '409',
            })
          );
        }
        const dateObj = new Date(time_register * 1000);

        const hash = await bcrypt.hash(time_register.toString(), 10);

        const callbackRegister = await Device.create({
          id,
          time_register: dateObj,
          password: hash,
          status: true,
        }); // callback register

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'success',
            message: 'Device registered successfully',
            midware_timestamp: Math.floor(Date.now() / 1000),
            response_code: '201',
            password: callbackRegister.password,
            raw_password: time_register.toString(),
          })
        );
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'error',
            message: 'Server error',
            midware_timestamp: Math.floor(Date.now() / 1000),
            response_code: '500',
          })
        );
      }
    });
  } else if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { id, password } = JSON.parse(body);

        if (!id || !password) {
          res.writeHead(400);
          return res.end(
            JSON.stringify({
              status: 'fail',
              message: 'Missing id or password',
              midware_timestamp: Math.floor(Date.now() / 1000),
              response_code: '400',
            })
          );
        }

        const device = await Device.findByPk(id);
        if (!device) {
          res.writeHead(404);
          return res.end(
            JSON.stringify({
              status: 'fail',
              message: 'Device not found',
              midware_timestamp: Math.floor(Date.now() / 1000),
              response_code: '404',
            })
          );
        }

        const match = await bcrypt.compare(password.toString(), device.password);
        if (!match) {
          res.writeHead(401);
          return res.end(
            JSON.stringify({
              status: 'fail',
              message: 'Invalid credentials',
              midware_timestamp: Math.floor(Date.now() / 1000),
              response_code: '401',
            })
          );
        }
        // token protected
        const tokenPayload = {
          id: device.id,
          time_register: device.time_register,
        };

        const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' }); // token

        res.writeHead(200);
        res.end(
          JSON.stringify({
            status: 'success',
            message: 'Login successful',
            midware_timestamp: Math.floor(Date.now() / 1000),
            token,
            response_code: '200',
          })
        );
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            status: 'error',
            message: 'Server error',
            midware_timestamp: Math.floor(Date.now() / 1000),
            response_code: '500',
          })
        );
      }
    });
    // token protected
  } else if (req.method === 'GET' && req.url === '/protected') {
    verifyToken(req, res, () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'success',
          message: 'You have access to protected route',
          device_id: req.device.id,
          midware_timestamp: Math.floor(Date.now() / 1000),
          response_code: '200',
        })
      );
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'fail',
        message: 'Endpoint not found',
        midware_timestamp: Math.floor(Date.now() / 1000),
        response_code: '404',
      })
    );
  }
});

server.listen(PORT, () => {
  console.log(`Auth service (register & login) running on http://localhost:${PORT}`);
});
