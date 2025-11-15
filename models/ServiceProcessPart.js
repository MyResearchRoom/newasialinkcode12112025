"use strict";

module.exports = (sequelize, DataTypes) => {
    const ServiceProcessPart = sequelize.define(
        "ServiceProcessPart",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            serviceProcessId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            partName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        },
        {
            tableName: "service_process_parts",
            timestamps: true,
        }
    );

    ServiceProcessPart.associate = (models) => {
        ServiceProcessPart.belongsTo(models.ServiceProcessDetail, {
            foreignKey: "serviceProcessId",
            as: "processDetail",
        });
    };

    return ServiceProcessPart;
};
