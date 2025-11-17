'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('booked_services', 'pickupPersonId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await queryInterface.addColumn('booked_services', 'scheduledPickupDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('booked_services', 'pickupPersonId');
    await queryInterface.removeColumn('booked_services', 'scheduledPickupDate');
  }
};
