"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("booked_services", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      bookedServiceId: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      addressId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        refrences: {
          model: "CustomerAddresses",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      status: {
        type: Sequelize.ENUM("pending", "accepted", "rejected"),
        defaultValue: "pending",
      },
      preferredServiceDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      pickupRequired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      pickupDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      pickupTimeSlot: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      additionalNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      currentStep: {
        type: Sequelize.ENUM("estimation", "pickup", "process", "completed"),
        defaultValue: "estimation",
      },
      stepDates: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("booked_services");
  },
};

