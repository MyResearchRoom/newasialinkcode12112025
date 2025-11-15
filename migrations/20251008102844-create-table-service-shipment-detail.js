"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("service_shipment_details", {
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
      courierCompanyName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      trackingId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pickUpDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      estimatedDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      shipmentType: {
        type: Sequelize.ENUM("standard", "express", "overnight"),
        allowNull: true,
      },
      paymentMode: {
        type: Sequelize.ENUM("debit_card", "bank_transfer", "upi", "cash", "other"),
        allowNull: false,
      },
      deliveryPersonName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      deliveryPersonNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pickupLocation: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deliveryAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      },
      imageContentType: {
        type: Sequelize.STRING,
        allowNull: true,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("service_shipment_details");
  },
};
