module.exports = (sequelize, DataTypes) => {
  const OrderShipmentDetails = sequelize.define(
    "OrderShipmentDetails",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "product_orders",
          key: "orderId",
        },
        onDelete: "CASCADE",
      },
      courierCompanyName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      trackingId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pickupDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      estimatedDeliveryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      shipmentType: {
        type: DataTypes.ENUM("standard", "express", "oneDay"),
        allowNull: false,
      },
      paymentMode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      boxWeight: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      length: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      width: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      height: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      numberOfBoxes: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pickupLocation: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "order_shipment_details",
      timestamps: true,
    }
  );

  OrderShipmentDetails.associate = (models) => {
    OrderShipmentDetails.belongsTo(models.ProductOrder, {
      foreignKey: "orderId",
      as: "order",
    });
  };

  return OrderShipmentDetails;
};
