"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("service_process_details", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      bookedServiceId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "booked_services",
          key: "bookedServiceId",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      stepName: {
        type: Sequelize.ENUM(
          "orderReceived",
          "partOrders",
          "partReceived",
          "repairProcess",
          "testing",
          "invoice",
          "paymentStatus",
          "outForDelivery",
          "completed"
        ),
        allowNull: false,
      },
      stepDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      stepStatus: {
        type: Sequelize.ENUM("pending", "inProgress", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },
      statusNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      partNeeded: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("service_process_details");
  },
};
