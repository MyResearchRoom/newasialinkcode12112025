"use strict";

module.exports = (sequelize, DataTypes) => {
    const ServiceShipmentDetails = sequelize.define(
        "ServiceShipmentDetails",
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
            courierCompanyName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            trackingId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            pickUpDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            estimatedDeliveryDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            shipmentType: {
                type: DataTypes.ENUM("standard", "express", "overnight"),
                allowNull: true,
            },
            paymentMode: {
                type: DataTypes.ENUM("debit_card", "bank_transfer", "upi", "cash", "other"),
                allowNull: false,
            },
            deliveryPersonName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            deliveryPersonNumber: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            pickupLocation: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            deliveryAddress: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            image: {
                type: DataTypes.BLOB("long"),
                allowNull: true,
            },
            imageContentType: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "service_shipment_details",
            timestamps: true,
        }
    );

    ServiceShipmentDetails.associate = (models) => {
        ServiceShipmentDetails.belongsTo(models.BookedService, {
            foreignKey: "bookedServiceId",
            as: "bookedService",
        });
    };

    ServiceShipmentDetails.addHook("beforeValidate", (shipment) => {
        if (shipment.courierCompanyName) {
            shipment.deliveryPersonName = null;
            shipment.deliveryPersonNumber = null;
        } else if (shipment.deliveryPersonName) {
            shipment.courierCompanyName = null;
            shipment.shipmentType = null;
            // shipment.trackingId = null;
        }
    });

    return ServiceShipmentDetails;
};
