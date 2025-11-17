"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("service_payments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      serviceInvoiceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "service_invoices",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      paymentMode: {
        type: Sequelize.ENUM(
          "debit_card",
          "bank_transfer",
          "upi",
          "cash",
          "other"
        ),
        allowNull: false,
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      installmentAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      transactionRefId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentStatus: {
        type: Sequelize.ENUM("pending", "partial", "completed"),
        defaultValue: "pending",
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
    await queryInterface.dropTable("service_payments");
  },
};
