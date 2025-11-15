"use strict";

module.exports = (sequelize, DataTypes) => {
    const ProductStock = sequelize.define("ProductStock",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            stockId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "categories",
                    key: "id"
                },
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "id"
                },
            },
            model: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            supplierName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            currentStock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            lowStockThreshold: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            restockQuantity: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            pricePerUnit: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            restockDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            totalPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            }
        },
        {
            tableName: "product_stocks",
            hooks: {
                beforeCreate: async (stock) => {
                    const lastStock = await ProductStock.findOne({
                        order: [["createdAt", "DESC"]],
                    });

                    let nextNumber = 1;
                    if (lastStock && lastStock.stockId) {
                        const match = lastStock.stockId.match(/\d+$/);
                        if (match) {
                            nextNumber = parseInt(match[0], 10) + 1;
                        }
                    }

                    stock.stockId = `STK${String(nextNumber).padStart(4, "0")}`;
                },
            },
        }
    );
    ProductStock.associate = (models) => {
        ProductStock.belongsTo(models.Category, {
            foreignKey: "categoryId",
            as: 'category'
        });
        ProductStock.belongsTo(models.Product, {
            foreignKey: "productId",
            as: "product"
        });
        ProductStock.hasMany(models.ProductStockDocument, {
            foreignKey: "stockId",
            as: "documents",
        });
    };

    return ProductStock;
}