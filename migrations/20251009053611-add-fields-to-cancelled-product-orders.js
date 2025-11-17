'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('cancelled_product_orders', 'status', {
      type: Sequelize.ENUM('pending', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('cancelled_product_orders', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_cancelled_product_orders_status";');
  }
};
