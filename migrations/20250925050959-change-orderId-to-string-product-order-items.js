'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove existing integer foreign key if exists
    await queryInterface.removeConstraint('product_order_items', 'product_order_items_ibfk_1');

    // Change column type to STRING
    await queryInterface.changeColumn('product_order_items', 'orderId', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Add foreign key to product_orders.orderId
    await queryInterface.addConstraint('product_order_items', {
      fields: ['orderId'],
      type: 'foreign key',
      name: 'fk_orderId',
      references: {
        table: 'product_orders',
        field: 'orderId',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('product_order_items', 'fk_orderId');

    await queryInterface.changeColumn('product_order_items', 'orderId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

  }
};
