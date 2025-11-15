"use strict"

module.exports = (sequelize, DataTypes) => {
    const EstimationDocument = sequelize.define(
        "EstimationDocument",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            bookedServiceId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "booked_services",
                    key: "bookedServiceId"
                }
            },
            document: {
                type: DataTypes.BLOB("long"),
                allowNull: false
            },
            documentName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            documentContentType: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            tableName: "estimation_documents",
            timestamps: true
        }
    );
    EstimationDocument.associate = (models) => {
        EstimationDocument.belongsTo(models.BookedService, {
            foreignKey: "bookedServiceId",
            targetKey: "bookedServiceId",
            as: "bookedService"
        });
    };

    return EstimationDocument;
};