"use strict"

module.exports = (sequelize, DataTypes) => {
    const BookedServiceItem = sequelize.define("BookedServiceItem", {
        bookedServiceId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        deviceType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        brandName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        modelNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        warranty: {
            type: DataTypes.ENUM("yes", "no", "notSure"),
            allowNull: false
        },
        noOfDevices: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        issueStartDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        problemDescription: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        estimatedCost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        estimatedDays: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
        {
            tableName: "booked_service_items",
            timestamps: true
        }
    );

    BookedServiceItem.associate = (models) => {
        BookedServiceItem.belongsTo(models.Service, {
            foreignKey: "serviceId",
            as: "service"
        });
        BookedServiceItem.belongsTo(models.BookedService, {
            foreignKey: "bookedServiceId",
            targetKey: "bookedServiceId",
            // targetKey: "id",
            as: "bookedService"
        });
        BookedServiceItem.hasMany(models.BookedServiceItemImage, {
            foreignKey: "bookedServiceItemId",
            as: "images",
        });
    };

    return BookedServiceItem;
}