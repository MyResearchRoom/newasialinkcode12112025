'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('carts', 'selectedColor', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('carts', 'selectedSize', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('carts', 'selectedColor');
    await queryInterface.removeColumn('carts', 'selectedSize');
  }
};
