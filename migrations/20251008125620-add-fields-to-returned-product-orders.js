"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("returned_product_orders", "pickupPersonId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.addColumn("returned_product_orders", "pickupDate", {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn("returned_product_orders", "pickUpTime", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn("returned_product_orders", "returnStatus", {
      type: Sequelize.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
      allowNull: false
    });

    await queryInterface.addColumn("returned_product_orders", "pickupStatus", {
      type: Sequelize.ENUM("pending", "pickedUp", "completed"),
      defaultValue: "pending",
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("returned_product_orders", "pickupPersonId");
    await queryInterface.removeColumn("returned_product_orders", "pickupDate");
    await queryInterface.removeColumn("returned_product_orders", "pickUpTime");
    await queryInterface.removeColumn("returned_product_orders", "returnStatus");
    await queryInterface.removeColumn("returned_product_orders", "pickupStatus");

  }
};
