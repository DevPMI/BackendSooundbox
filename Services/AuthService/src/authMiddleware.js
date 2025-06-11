const jwt = require('jsonwebtoken');

const SECRET_KEY = 'rahasia'; // Ganti dengan kunci rahasia aslimu

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.writeHead(401, { 'Content-Type': 'application/json' })
      .end(JSON.stringify({
        status: 'fail',
        message: 'No token provided',
        response_code: '401',
        midware_timestamp: Math.floor(Date.now() / 1000)
      }));
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.writeHead(403, { 'Content-Type': 'application/json' })
        .end(JSON.stringify({
          status: 'fail',
          message: 'Invalid token',
          response_code: '403',
          midware_timestamp: Math.floor(Date.now() / 1000)
        }));
    }

    // Simpan data token di request
    req.device = decoded;
    next(); // Lanjut ke handler berikutnya
  });
}

module.exports = verifyToken;
