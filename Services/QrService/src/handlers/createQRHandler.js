require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const { QRTransaction } = require('../db');
const { logRequest, logResponse, logError } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

module.exports = function createQRHandler(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    logRequest(req, body);

    let data;
    try {
      data = JSON.parse(body);
    } catch (err) {
      return sendError(res, 400, 'Invalid JSON body');
    }

    try {
      const response = await fetch('https://api.xendit.co/qr_codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-version': '2022-07-31',
          'idempotency-key': uuidv4(),
          Authorization: 'Basic ' + Buffer.from(`${process.env.XENDIT_API_KEY}:`).toString('base64')
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        logResponse(response.status, result.message);
        return sendError(res, response.status, result.message, result.error_code);
      }

      // Simpan ke database
      await QRTransaction.create({
        qr_id        : result.id,
        reference_id : result.reference_id,
        type         : result.type,
        currency     : result.currency,
        amount       : result.amount,
        channel_code : result.channel_code,
        status       : result.status,
        qr_string    : result.qr_string,
        expires_at   : result.expires_at,
        created      : result.created,
        updated      : result.updated
      });

      logResponse(200, 'QR Code created & saved');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        data: result,
        response_code: '200',
        midware_timestamp: Math.floor(Date.now() / 1000)
      }));
    } catch (err) {
      logError(err);
      return sendError(res, 500, 'Internal server error');
    }
  });
};

function sendError(res, code, message, error_code = 'ERROR') {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'fail',
    message,
    error_code,
    response_code: String(code),
    midware_timestamp: Math.floor(Date.now() / 1000)
  }));
}
