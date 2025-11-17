"use strict";
module.exports = (sequelize, DataTypes) => {
    const BookedServiceItemImage = sequelize.define("BookedServiceItemImage", {
        bookedServiceItemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
            tableName: "booked_service_item_images",
            timestamps: true
        }
    );

    BookedServiceItemImage.associate = (models) => {
        BookedServiceItemImage.belongsTo(models.BookedServiceItem, {
            foreignKey: "bookedServiceItemId",
            as: "item"
        });
    };

    return BookedServiceItemImage;
};
