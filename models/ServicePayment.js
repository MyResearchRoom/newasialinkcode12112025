"use strict";

module.exports = (sequelize, DataTypes) => {
    const ServicePayment = sequelize.define(
        "ServicePayment",
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
            paymentMode: {
                type: DataTypes.ENUM("debit_card", "bank_transfer", "upi", "cash", "other"),
                allowNull: false,
            },
            paymentDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            installmentAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            transactionRefId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            paymentStatus: {
                type: DataTypes.ENUM("pending", "partial", "completed"),
                defaultValue: "pending",
            },
        },
        {
            tableName: "service_payments",
            timestamps: true,
        }
    );

    ServicePayment.associate = (models) => {
        ServicePayment.belongsTo(models.ServiceInvoice, {
            foreignKey: "serviceInvoiceId",
            as: "invoice",
        });
    };

    return ServicePayment;
};
