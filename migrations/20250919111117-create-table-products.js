"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      productName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      originalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      discountPercent: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      discountedPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      screenSize: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      cpuModel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ram: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      operatingSystem: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      specialFeature: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      graphicsCard: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      displaySections: {
        type: Sequelize.ENUM("BEST_SELLER", "NEW_ARRIVAL", "OFFERS_DISCOUNTS"),
        allowNull: false,
      },
      specifications: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      configurations: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      colors: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      sizes: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      moreDetails: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      isBlock: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable("products");
  },
};
