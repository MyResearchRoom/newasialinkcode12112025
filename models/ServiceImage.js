"use strict";

module.exports = (sequelize, DataTypes) => {
    const ServiceImage = sequelize.define(
        "ServiceImage",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            serviceId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "services",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            image: {
                type: DataTypes.BLOB("long"),
                allowNull: false,
            },
            imageContentType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: "service_images",
            timestamps: true,
        }
    );

    ServiceImage.associate = (models) => {
        ServiceImage.belongsTo(models.Service, {
            foreignKey: "serviceId",
            as: "service",
        });
    };

    return ServiceImage;
};
