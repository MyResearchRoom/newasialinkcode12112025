'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM(
        "ADMIN",
        "PRODUCT_MANAGER",
        "SERVICE_MANAGER",
        "CUSTOMER",
        "DELIVERY_ASSOCIATE"
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "role", {
      type: Sequelize.ENUM(
        "ADMIN",
        "PRODUCT_MANAGER",
        "SERVICE_MANAGER",
        "CUSTOMER"
      ),
      allowNull: false,
    });
  }
};
