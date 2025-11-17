'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('booked_services', 'estimationNotes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('booked_services', 'clientApprovalReason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('booked_services', 'estimationNotes');
    await queryInterface.removeColumn('booked_services', 'clientApprovalReason');
  }
};
