require('dotenv').config();
const fetch = (...args) =>
import('node-fetch').then(mod => mod.default(...args));
const { QRTransaction, Device } = require('../db');   //  Device
const { logRequest, logResponse, logError } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

module.exports = function createQRHandler(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));

  req.on('end', async () => {
    logRequest(req, body);

    /* ──── 1. Parse JSON ──── */
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return sendError(res, 400, 'Invalid JSON body');
    }

    /* ──── 2. Validasi device_id ──── */
    const device = await Device.findByPk(data.device_id);
    if (!device) {
      return sendError(res, 404, 'Device not found');
    }

    try {
      /* ──── 3. Call API Xendit ──── */
      const response = await fetch('https://api.xendit.co/qr_codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-version': '2022-07-31',
          'idempotency-key': uuidv4(),
          Authorization:
            'Basic ' +
            Buffer.from(`${process.env.XENDIT_API_KEY}:`).toString('base64') // <- fix
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      /* ──── 4. Error dari Xendit ──── */
      if (!response.ok) {
        logResponse(response.status, result.message);
        return sendError(
          res,
          response.status,
          result.message,
          result.error_code
        );
      }

      /* ──── 5. Simpan ke DB ──── */
      await QRTransaction.create({
        qr_id:        result.id,            // id dari Xendit
        reference_id: result.reference_id,
        device_id:    data.device_id,       // FK
        type:         result.type,
        currency:     result.currency,
        amount:       result.amount,
        channel_code: result.channel_code,
        status:       result.status,
        qr_string:    result.qr_string,
        expires_at:   result.expires_at,
        created_at:   result.created,
        updated_at:   result.updated
      });

      /* ──── 6. Sukses ──── */
      logResponse(200, 'QR Code created & saved');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'success',
          data: result,
          response_code: '200',
          midware_timestamp: Math.floor(Date.now() / 1000)
        })
      );
    } catch (err) {
      logError(err);
      sendError(res, 500, 'Internal server error');
    }
  });
};

/* Helper */
function sendError(res, code, message, error_code = 'ERROR') {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      status: 'fail',
      message,
      error_code,
      response_code: String(code),
      midware_timestamp: Math.floor(Date.now() / 1000)
    })
  );
}
