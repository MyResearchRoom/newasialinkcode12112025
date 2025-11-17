"use strict"

module.exports = (sequelize, DataTypes) => {
    const ProductOrder = sequelize.define(
        "ProductOrder",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            orderId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            addressId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            paymentMethod: {
                type: DataTypes.ENUM("debit_card", "netbanking", "upi", "cod"),
                allowNull: false
            },
            status: {
                type: DataTypes.ENUM("newRequest", "processing", "shipped", "outForDelivery", "delivered", "cancelled"),
                allowNull: false,
                defaultValue: "newRequest"
            },
            totalItems: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            subTotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            discountAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            gstAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            handlingCharges: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            totalAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            } // total = subTotal - discount + gst + handling
        },
        {
            tableName: "product_orders",
            timestamps: true
        }
    );

    ProductOrder.associate = (models) => {
        ProductOrder.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user"
        });
        ProductOrder.belongsTo(models.CustomerAddresses, {
            foreignKey: "addressId",
            as: "address"
        });
        ProductOrder.hasMany(models.ProductOrderItem, {
            foreignKey: "orderId",
            sourceKey: "orderId",
            as: "items"
        });
        ProductOrder.hasOne(models.OrderShipmentDetails, {
            foreignKey: "orderId",
            sourceKey: "orderId",
            as: "shipment",
        });
    }

    return ProductOrder;
};