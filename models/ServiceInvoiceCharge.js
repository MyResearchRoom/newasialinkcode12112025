"use strict";

module.exports = (sequelize, DataTypes) => {
  const ServiceInvoiceCharge = sequelize.define(
    "ServiceInvoiceCharge",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      serviceInvoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      chargeName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chargeAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "service_invoice_charges",
      timestamps: true,
    }
  );

  ServiceInvoiceCharge.associate = (models) => {
    ServiceInvoiceCharge.belongsTo(models.ServiceInvoice, {
      foreignKey: "serviceInvoiceId",
      as: "invoice",
    });
  };

  return ServiceInvoiceCharge;
};
