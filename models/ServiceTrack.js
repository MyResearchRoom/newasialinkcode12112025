"use strict";

module.exports = (sequelize, DataTypes) => {
    const ServiceTrack = sequelize.define(
        "ServiceTrack",
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
            status: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            notes: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "service_track",
            timestamps: false,
        }
    );

    ServiceTrack.associate = (models) => {
        ServiceTrack.belongsTo(models.BookedService, {
            foreignKey: "bookedServiceId",
            as: "bookedService",
        });
    };

    return ServiceTrack;
};
