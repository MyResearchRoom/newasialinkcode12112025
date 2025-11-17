"use-strict"

module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define("Category",
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            image: {
                type: DataTypes.BLOB("long"),
                allowNull: true,
            },
            imageContentType: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isBlock: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
        },
        {
            tableName: "categories"
        }
    );

    Category.associate = (models) => {
        Category.hasMany(models.Product, {
            foreignKey: "categoryId",
            as: "products",
            onDelete: "CASCADE"
        });
    };

    return Category;
}