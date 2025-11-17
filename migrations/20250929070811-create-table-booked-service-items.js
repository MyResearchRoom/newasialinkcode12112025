"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("booked_service_items", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      bookedServiceId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "booked_services",
          key: "bookedServiceId"
        },
        onDelete: "CASCADE",
      },
      serviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "services",
          key: "id"
        },
        onDelete: "CASCADE",
      },
      deviceType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      brandName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      modelNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      warranty: {
        type: Sequelize.ENUM("yes", "no", "notSure"),
        allowNull: false,
      },
      noOfDevices: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      issueStartDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      problemDescription: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("booked_service_items");
  },
};
