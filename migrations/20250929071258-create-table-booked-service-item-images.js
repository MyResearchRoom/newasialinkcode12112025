"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("booked_service_item_images", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      bookedServiceItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "booked_service_items",
          key: "id"
        },
        onDelete: "CASCADE",
      },
      image: {
        type: Sequelize.BLOB("long"),
        allowNull: false,
      },
      imageContentType: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("booked_service_item_images");
  },
};
