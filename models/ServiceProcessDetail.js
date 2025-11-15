"use strict";

module.exports = (sequelize, DataTypes) => {
    const ServiceProcessDetail = sequelize.define(
        "ServiceProcessDetail",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            bookedServiceId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            stepName: {
                type: DataTypes.ENUM(
                    "orderReceived",
                    "partOrders",
                    "partReceived",
                    "repairProcess",
                    "testing",
                    "invoice",
                    "paymentStatus",
                    "outForDelivery",
                    "completed"
                ),
                allowNull: false,
            },
            stepDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            stepStatus: {
                type: DataTypes.ENUM("pending", "inProgress", "completed"),
                defaultValue: "pending",
            },
            statusNotes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            partNeeded: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: true,
            },
        },
        {
            tableName: "service_process_details",
            timestamps: true,
        }
    );
    ServiceProcessDetail.associate = (models) => {
        ServiceProcessDetail.belongsTo(models.BookedService, {
            foreignKey: "bookedServiceId",
            targetKey: "bookedServiceId",
            as: "bookedService",
        });
        ServiceProcessDetail.hasMany(models.ServiceProcessPart, {
            foreignKey: "serviceProcessId",
            as: "parts",
        });
    };

    return ServiceProcessDetail;
};
