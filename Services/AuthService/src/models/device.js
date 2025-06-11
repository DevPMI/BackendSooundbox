// src/models/device.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  time_register: {
    type: DataTypes.DATE,
    allowNull: false
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'devices',
  timestamps: false
});

module.exports = Device;
