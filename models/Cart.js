"use strict"

module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define("Cart",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            selectedColor: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            selectedSize: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "carts",
            timeStamps: true,
        }
    );

    Cart.associate = (models) => {
        Cart.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user"
        });
        Cart.belongsTo(models.Product, {
            foreignKey: "productId",
            as: "product"
        });
    };

    return Cart;
};