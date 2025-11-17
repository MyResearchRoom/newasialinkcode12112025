"use strict";

module.exports = (sequelize, DataTypes) => {
    const Service = sequelize.define(
        "Service",
        {
            serviceName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            oldPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            discountPercent: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            displaySections: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
            serviceType: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            moreInfo: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            isBlock: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        },
        {
            tableName: "services",
        }
    );
    Service.associate = (models) => {
        Service.hasMany(models.ServiceImage, {
            foreignKey: "serviceId",
            as: "images",
        });
    };

    return Service;
};
