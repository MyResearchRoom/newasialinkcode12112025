'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("product_orders", "status", {
      type: Sequelize.ENUM(
        "newRequest",
        "processing",
        "shipped",
        "outForDelivery",
        "delivered",
        "cancelled"
      ),
      allowNull: false,
      defaultValue: "newRequest"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("product_orders", "status", {
      type: Sequelize.ENUM(
        "newRequest",
        "processing",
        "shipped",
        "outForDelivery",
        "delivered"
      ),
      allowNull: false,
      defaultValue: "newRequest"
    });
  }
};