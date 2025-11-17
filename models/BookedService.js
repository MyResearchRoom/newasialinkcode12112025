"use strict"

module.exports = (sequelize, DataTypes) => {
    const BookedService = sequelize.define("BookedService", {
        bookedServiceId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        addressId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("pending", "accepted", "rejected", "cancelled", "completed"),
            defaultValue: "pending",
        },
        preferredServiceDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        pickupRequired: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        pickupDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        pickupTimeSlot: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        additionalNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        currentStep: {
            type: DataTypes.ENUM("estimation", "pickup", "process"),
            defaultValue: "estimation",
        },
        stepDates: {
            type: DataTypes.JSON,
            defaultValue: {}
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        discountPercent: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        totalCost: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        finalCost: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        clientApprovalStatus: {
            type: DataTypes.ENUM("pending", "approved", "rejected"),
            allowNull: "pending"
        },
        pickupPersonId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        scheduledPickupDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        estimationNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        clientApprovalReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
        {
            tableName: "booked_services",
            timestamps: true
        }
    );
    BookedService.associate = (models) => {
        BookedService.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user"
        });
        BookedService.belongsTo(models.CustomerAddresses, {
            foreignKey: "addressId",
            as: "address"
        });
        BookedService.hasMany(models.BookedServiceItem, {
            foreignKey: "bookedServiceId",
            sourceKey: "bookedServiceId",
            // sourceKey: "id",
            as: "items"
        });
        BookedService.belongsTo(models.User, {
            foreignKey: "pickupPersonId",
            as: "pickupPerson"
        });
        BookedService.hasMany(models.EstimationDocument, {
            foreignKey: "bookedServiceId",
            sourceKey: "bookedServiceId",
            as: "documents"
        });
        BookedService.hasMany(models.ServiceProcessDetail, {
            foreignKey: "bookedServiceId",
            sourceKey: "bookedServiceId",
            as: "processSteps",
        });
    };

    return BookedService;
}