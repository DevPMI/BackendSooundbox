'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Device extends Model {
    static associate(models) {
      Device.hasMany(models.QRTransaction, {
        foreignKey: 'device_id',
        as: 'qr_transactions',
      });
    }
  }

  Device.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      time_register: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Device',
      tableName: 'devices',
      timestamps: false,
    }
  );

  return Device;
};
