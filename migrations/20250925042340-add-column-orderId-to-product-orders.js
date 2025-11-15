'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_orders', 'orderId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      after: 'id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('product_orders', 'orderId');
  }
};
