"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn("booked_service_items", "estimatedCost", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn("booked_service_items", "estimatedDays", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("booked_services", "discountPercent", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });

    await queryInterface.addColumn("booked_services", "totalCost", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });

    await queryInterface.addColumn("booked_services", "finalCost", {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("booked_service_items", "estimatedCost");
    await queryInterface.removeColumn("booked_service_items", "estimatedDays");
    await queryInterface.removeColumn("booked_services", "discountPercent");
    await queryInterface.removeColumn("booked_services", "totalCost");
    await queryInterface.removeColumn("booked_services", "finalCost");
  }
};
