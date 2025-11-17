"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("booked_services", "status", {
      type: Sequelize.ENUM("pending", "accepted", "rejected", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("booked_services", "status", {
      type: Sequelize.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    });
  },
};
