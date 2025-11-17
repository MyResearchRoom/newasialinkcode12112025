'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('returned_product_orders', 'refundStatus', {
      type: Sequelize.ENUM('pending', 'refunded'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('returned_product_orders', 'refundStatus');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_returned_product_orders_refundStatus";');
  }
};
