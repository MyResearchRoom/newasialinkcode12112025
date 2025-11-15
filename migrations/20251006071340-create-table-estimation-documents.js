"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("estimation_documents", {
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
          key: "bookedServiceId"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      document: {
        type: Sequelize.BLOB("long"),
        allowNull: false
      },
      documentName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      documentContentType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("estimation_documents");
  }
};
