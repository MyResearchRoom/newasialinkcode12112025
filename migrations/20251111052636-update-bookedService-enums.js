"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("booked_services", "status", {
      type: Sequelize.ENUM("pending", "accepted", "rejected", "cancelled", "completed"),
      defaultValue: "pending",
      allowNull: false,
    });

    await queryInterface.changeColumn("booked_services", "currentStep", {
      type: Sequelize.ENUM("estimation", "pickup", "process"),
      defaultValue: "estimation",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("booked_services", "status", {
      type: Sequelize.ENUM("pending", "accepted", "rejected", "cancelled"),
      defaultValue: "pending",
      allowNull: false,
    });

    await queryInterface.changeColumn("booked_services", "currentStep", {
      type: Sequelize.ENUM("estimation", "pickup", "process", "completed"),
      defaultValue: "estimation",
    });
  },
};
