module.exports = (sequelize, DataTypes) => {
  const QRTransaction = sequelize.define('QRTransaction', {
    reference_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    qr_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: DataTypes.STRING,
    currency: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    status: DataTypes.STRING,
    qr_string: DataTypes.TEXT,
    channel_code: DataTypes.STRING,
    expires_at: DataTypes.DATE,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    tableName: 'qr_transactions',
    timestamps: false, // Disable automatic timestamps
  });

  return QRTransaction;
};
