"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("booked_services", "clientApprovalStatus", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("booked_services", "clientApprovalStatus");
  }
};