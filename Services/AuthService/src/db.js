// src/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Inisialisasi koneksi
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);
// test koneksi
sequelize.authenticate()
  .then(() => console.log(' DB Connected'))
  .catch(err => console.error(' DB Connection Error:', err));

module.exports = sequelize;
