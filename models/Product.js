"use-strict"

module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define("Product",
        {
            productName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            model: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "categories",
                    key: "id",
                },
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            originalPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            discountPercent: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            discountedPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            screenSize: {
                type: DataTypes.STRING,
                allowNull: true
            },
            cpuModel: {
                type: DataTypes.STRING,
                allowNull: true
            },
            ram: {
                type: DataTypes.STRING,
                allowNull: true
            },
            operatingSystem: {
                type: DataTypes.STRING,
                allowNull: true
            },
            specialFeature: {
                type: DataTypes.STRING,
                allowNull: true
            },
            graphicsCard: {
                type: DataTypes.STRING,
                allowNull: true
            },
            displaySections: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
            specifications: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            configurations: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            colors: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            sizes: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            moreDetails: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            isBlock: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            gstPercent: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false
            },
            gstPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            handlingCharges: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            totalStock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            }
        },
        {
            tableName: "products"
        }
    );
    Product.associate = (models) => {
        Product.belongsTo(models.Category, {
            foreignKey: "categoryId",
            as: "category",
        });
        Product.hasMany(models.ProductImage, {
            foreignKey: "productId",
            as: "images",
        });
        Product.hasMany(models.ProductReview, {
            foreignKey: "productId",
            as: "reviews",
        });
        Product.hasMany(models.ProductStock, {
            foreignKey: "productId",
            as: "stocks",
            onDelete: "CASCADE",
        });
    };

    return Product;
}