'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Tambahkan kolom device_id, boleh null dulu
    await queryInterface.addColumn('qr_transactions', 'device_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Tambahkan constraint FK
    await queryInterface.addConstraint('qr_transactions', {
      fields: ['device_id'],
      type: 'foreign key',
      name: 'fk_qr_transactions_device_id',
      references: {
        table: 'devices',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    // (opsional) isi nilai default device_id jika perlu (bisa query manual)
    // await queryInterface.sequelize.query(`UPDATE qr_transactions SET device_id = 'default-device-id' WHERE device_id IS NULL`);

    // 3. Kalau sudah yakin semua nilai sudah terisi, bisa diubah jadi NOT NULL dengan migrasi baru
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('qr_transactions', 'fk_qr_transactions_device_id');
    await queryInterface.removeColumn('qr_transactions', 'device_id');
  }
};
