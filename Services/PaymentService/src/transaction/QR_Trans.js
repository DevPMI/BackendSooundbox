// src/QR_Trans.js
const axios = require('axios');
const API_KEY = 'xnd_development_O46JfOtygef9kMNsK+ZPGT+TeStIngw3Dn+R1k+2fT/7GlCAN3jg==';

async function createQR(referenceId, amount) {
  try {
    const response = await axios.post(
      'https://api.xendit.co/qr_codes',
      {
        reference_id: referenceId,
        type: 'STATIC', // atau 'DYNAMIC'
        currency: 'IDR',
        amount: amount,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      {
        auth: {
          username: API_KEY,
          password: '',
        },
        headers: {
          'api-version': '2022-07-31',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('QR Code Created:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.data);
      throw error.response.data;
    } else {
      console.error('Unexpected Error:', error.message);
      throw error;
    }
  }
}

module.exports = { createQR };
