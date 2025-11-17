'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('products', 'displaySections', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('products', 'displaySections', {
      type: Sequelize.ENUM('BEST_SELLER', 'NEW_ARRIVAL', 'OFFERS_DISCOUNTS'),
      allowNull: false,
    });
  },
};
