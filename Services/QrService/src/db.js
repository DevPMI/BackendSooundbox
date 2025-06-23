require('dotenv').config();
const { Sequelize } = require('sequelize');

const QRTransactionModel = require('./models/QRTransaction');
const DeviceModel = require('./models/device');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS + '',
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
  }
);

console.log({
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
  DB_HOST: process.env.DB_HOST,
});

const QRTransaction = QRTransactionModel(sequelize, Sequelize.DataTypes);
const Device = DeviceModel(sequelize, Sequelize.DataTypes);

// Hubungkan relasi (opsional untuk eager loading / include)
Device.associate?.({ QRTransaction });
QRTransaction.associate?.({ Device });

module.exports = {
  sequelize,
  QRTransaction,
  Device,
};

// test koneksi
sequelize.authenticate()
  .then(() => console.log(' DB Connected'))
  .catch(err => console.error(' DB Connection Error:', err));
