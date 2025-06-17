const { logRequest, logResponse, logError } = require('../utils/logger');
const { Transaction } = require('../models');

module.exports = async function inquiryHandler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.searchParams.get('id');

  logRequest(req, `Query ID: ${id}`);  // sekarang sudah terdefinisi

  if (!id) {
    logResponse(400, 'Missing id parameter');
    return fail(400, 'Missing id parameter', res);
  }

  try {
    const trx = await Transaction.findOne({ where: { device_id: id } });
    if (!trx) {
      logResponse(404, `No transaction for ID=${id}`);
      return fail(404, 'Transaction not found', res);
    }
    logResponse(200, `Transaction found for ID=${id}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      data: trx,
      midware_timestamp: Math.floor(Date.now() / 1000),
    }));
  } catch (e) {
    logError(e);
    return fail(500, 'Server error', res);
  }
};

function fail(code, msg, res) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'fail',
    message: msg,
    midware_timestamp: Math.floor(Date.now() / 1000),
  }));
}
