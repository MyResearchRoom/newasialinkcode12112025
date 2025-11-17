"use strict";

module.exports = (sequelize, DataTypes) => {
    const ServiceInvoice = sequelize.define(
        "ServiceInvoice",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            bookedServiceId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            invoiceNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            invoiceDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            totalAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.0,
            },
        },
        {
            tableName: "service_invoices",
            timestamps: true,
        }
    );

    ServiceInvoice.associate = (models) => {
        ServiceInvoice.belongsTo(models.BookedService, {
            foreignKey: "bookedServiceId",
            as: "bookedService",
        });

        ServiceInvoice.hasMany(models.ServiceInvoiceCharge, {
            foreignKey: "serviceInvoiceId",
            as: "additionalCharges",
            onDelete: "CASCADE",
        });

        ServiceInvoice.hasMany(models.ServicePayment, {
            foreignKey: "serviceInvoiceId",
            as: "payments",
            onDelete: "CASCADE",
        });
    };

    return ServiceInvoice;
};
