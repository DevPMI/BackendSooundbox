// createQR.js
const { createQR } = require('./transaction/QR_Trans');


async function main() {
  const referenceId = 'order-id-' + Date.now();
  const amount = 10000;

  try {
    const qrData = await createQR(referenceId, amount);
    console.log('QR Code Created:', qrData);
  } catch (err) {
    console.error('Failed to create QR:', err);
  }
}

main();
