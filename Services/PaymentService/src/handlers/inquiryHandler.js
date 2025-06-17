// handlers/inquiryHandler.js
const { logRequest, logResponse, logError } = require('../utils/logger');
const { Transaction } = require('../models');

module.exports = async function inquiryHandler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.searchParams.get('id');

  logRequest(req, `Query ID: ${id}`);

  try {
    const transaction = await Transaction.findOne({ where: { device_id: id } });

    if (!transaction) {
      logResponse(404, `No transaction found for device ID: ${id}`);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'fail', message: 'Transaction not found' }));
    }

    logResponse(200, 'Transaction found');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'success',
      data: transaction
    }));

  } catch (error) {
    logError(error);
    logResponse(500, 'Server error');
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'fail', message: 'Server error' }));
  }
};
