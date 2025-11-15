const { Op, where } = require("sequelize");
const { Category, Product, ProductStock, ProductStockDocument, sequelize } = require("../models");
const generateStockId = require("../utils/generateStockId");

const ProductStockController = {

    async addStock(req, res) {
        try {
            const {
                categoryId,
                productId,
                model,
                supplierName,
                // currentStock,
                lowStockThreshold,
                restockQuantity,
                pricePerUnit,
                restockDate,
            } = req.body;

            if (!categoryId || !productId || !model || !supplierName || !lowStockThreshold || !restockQuantity || !pricePerUnit || !restockDate) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill the required fields"
                })
            }

            const latestStock = await ProductStock.findOne({
                where: { productId },
                order: [["createdAt", "DESC"]],
            });

            // const previousStock = latestStock ? latestStock.currentStock : 0;
            const currentStock = Number(restockQuantity);
            const totalPrice = currentStock * Number(pricePerUnit);

            const stockId = await generateStockId();

            const stock = await ProductStock.create({
                stockId,
                categoryId,
                productId,
                model,
                supplierName,
                currentStock,
                lowStockThreshold,
                restockQuantity,
                pricePerUnit,
                restockDate,
                totalPrice
            });

            const totalStock = await ProductStock.sum('currentStock', { where: { productId } });
            await Product.update(
                { totalStock: totalStock || 0 },
                { where: { id: productId } }
            );

            if (req.files && req.files.documents) {
                if (req.files.documents.length > 5) {
                    return res.status(400).json({
                        success: false,
                        message: "You can upload a maximum of 5 documents only",
                    });
                }

                const documentsData = req.files.documents.map((file) => ({
                    stockId: stock.id,
                    document: file.buffer,
                    documentContentType: file.mimetype,
                    documentName: file.originalname
                }));

                if (documentsData.length) await ProductStockDocument.bulkCreate(documentsData);
            }

            return res.status(200).json({
                success: true,
                message: "Stock added successfully",
                data: stock,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to add stock"
            });
        }
    },

    //old without search by category
    // async getStockList(req, res) {
    //     try {
    //         const { page = 1, limit = 10, search = "" } = req.query;
    //         const offset = (page - 1) * limit;

    //         const latestStocksRaw = await ProductStock.findAll({
    //             attributes: [
    //                 [sequelize.fn("MAX", sequelize.col("createdAt")), "latestStockCreated"],
    //                 "productId",
    //             ],
    //             group: ["productId"],
    //             raw: true,
    //         });

    //         const stocks = await ProductStock.findAll({
    //             where: {
    //                 [Op.or]: latestStocksRaw.map(s => ({
    //                     productId: s.productId,
    //                     createdAt: s.latestStockCreated,
    //                 })),

    //                 ...(search
    //                     ? {
    //                         [Op.or]: [
    //                             sequelize.where(
    //                                 sequelize.col("product.productName"),
    //                                 { [Op.like]: `%${search}%` }
    //                             ),
    //                             sequelize.where(
    //                                 sequelize.col("product.model"),
    //                                 { [Op.like]: `%${search}%` }
    //                             ),
    //                             sequelize.where(
    //                                 sequelize.col("category.name"),
    //                                 { [Op.like]: `%${search}%` }
    //                             ),
    //                         ],
    //                     }
    //                     : {}),

    //             },
    //             include: [
    //                 {
    //                     model: Product,
    //                     as: "product",
    //                     attributes: ["id", "productName", "model", "totalStock"]
    //                 },
    //                 {
    //                     model: Category,
    //                     as: "category",
    //                     attributes: ["id", "name"]
    //                 },
    //             ],
    //             order: [["createdAt", "DESC"]],
    //             limit: parseInt(limit, 10),
    //             offset: parseInt(offset, 10),
    //         });

    //         const stocksWithStatus = await Promise.all(
    //             stocks.map(async stock => {
    //                 const previousStock = (await ProductStock.sum("currentStock", {
    //                     where: { productId: stock.productId, createdAt: { [Op.lt]: stock.createdAt } },
    //                 })) || 0;

    //                 let status = "inStock";
    //                 if (stock.currentStock === 0) status = "outOfStock";
    //                 else if (stock.currentStock <= stock.lowStockThreshold) status = "lowStock";

    //                 return {
    //                     id: stock.id,
    //                     productId: stock.productId,
    //                     productName: stock.product.productName,
    //                     model: stock.product.model,
    //                     categoryId: stock.category.id,
    //                     categoryName: stock.category.name,
    //                     currentStock: stock.currentStock,
    //                     totalStock: stock.product.totalStock,
    //                     previousStock,
    //                     lowStockThreshold: stock.lowStockThreshold,
    //                     restockQuantity: stock.restockQuantity,
    //                     restockDate: stock.restockDate,
    //                     status,
    //                 };
    //             })
    //         );

    //         return res.status(200).json({
    //             success: true,
    //             message: "Stock list fetched successfully",
    //             currentPage: parseInt(page, 10),
    //             totalPages: Math.ceil(stocksWithStatus.length / limit),
    //             totalRecords: stocksWithStatus.length,
    //             data: stocksWithStatus,
    //         });
    //     } catch (error) {
    //         return res.status(500).json({
    //             success: false,
    //             message: "Failed to fetch stock list",
    //         });
    //     }
    // },

    //new api search with category name
    async getStockList(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;
            const offset = (page - 1) * limit;

            const latestStocksRaw = await ProductStock.findAll({
                attributes: [
                    [sequelize.fn("MAX", sequelize.col("createdAt")), "latestStockCreated"],
                    "productId",
                ],
                group: ["productId"],
                raw: true,
            });

            const latestConditions = latestStocksRaw.map((s) => ({
                productId: s.productId,
                createdAt: s.latestStockCreated,
            }));

            const searchCondition = search
                ? {
                    [Op.or]: [
                        sequelize.where(
                            sequelize.col("product.productName"),
                            { [Op.like]: `%${search}%` }
                        ),
                        sequelize.where(
                            sequelize.col("product.model"),
                            { [Op.like]: `%${search}%` }
                        ),
                        sequelize.where(
                            sequelize.col("category.name"),
                            { [Op.like]: `%${search}%` }
                        ),
                    ],
                }
                : {};

            const stocks = await ProductStock.findAll({
                where: {
                    [Op.or]: latestConditions,
                    ...searchCondition,
                },
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["id", "productName", "model", "totalStock"],
                    },
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "name"],
                    },
                ],
                order: [["createdAt", "DESC"]],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
            });

            const stocksWithStatus = stocks.map(stock => {
                let status = "inStock";
                if (stock.currentStock === 0) status = "outOfStock";
                else if (stock.currentStock <= stock.lowStockThreshold) status = "lowStock";

                return {
                    id: stock.id,
                    productId: stock.productId,
                    productName: stock.product?.productName,
                    model: stock.product?.model,
                    categoryName: stock.category?.name,
                    currentStock: stock.currentStock,
                    totalStock: stock.product?.totalStock,
                    lowStockThreshold: stock.lowStockThreshold,
                    restockQuantity: stock.restockQuantity,
                    restockDate: stock.restockDate,
                    status,
                };
            });

            return res.status(200).json({
                success: true,
                message: "Stock list fetched successfully",
                currentPage: parseInt(page, 10),
                totalRecords: stocks.length,
                totalPages: Math.ceil(stocks.length / limit),
                data: stocksWithStatus,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch stock list",
            });
        }
    },

    async getStockDetailsById(req, res) {
        try {
            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({ success: false, message: "Product Id is required" });
            }

            const stocks = await ProductStock.findAll({
                where: { productId },
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["id", "productName", "model", "totalStock"]
                    },
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "name"]
                    },
                    {
                        model: ProductStockDocument,
                        as: "documents",
                        attributes: ["id", "document", "documentName", "documentContentType"]
                    }
                ],
                order: [["createdAt", "DESC"]]
            });

            if (!stocks || stocks.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No stock history found for this product"
                });
            }

            const latestStock = stocks[0];

            const stockDetails = stocks.map(stock => {
                const currentStock = Number(stock.currentStock);
                const lowStockThreshold = Number(stock.lowStockThreshold);

                let status = "inStock";
                if (currentStock === 0) status = "outOfStock";
                else if (currentStock <= lowStockThreshold) status = "lowStock";

                const documents = stock.documents.map(doc => ({
                    id: doc.id,
                    documentName: doc.documentName,
                    document: doc.document
                        ? `data:${doc.documentContentType};base64,${doc.document.toString("base64")}`
                        : null
                }));

                return {
                    ...stock.toJSON(),
                    documents,
                    status,
                    latestCurrentStock: latestStock.currentStock,
                    totalStock: stock.product ? stock.product.totalStock : null
                };
            });

            return res.status(200).json({
                success: true,
                message: "Stock details fetched successfully",
                data: stockDetails
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch stock details"
            });
        }
    },

    async getTotalStockByProduct(req, res) {
        try {
            const { productId } = req.params;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required",
                });
            }

            const product = await Product.findOne({
                where: { id: productId },
                attributes: ["id", "productName", "totalStock"],
                include: [
                    {
                        model: ProductStock,
                        as: "stocks",
                        attributes: ["lowStockThreshold"],
                        order: [["createdAt", "DESC"]],
                        limit: 1,
                    },
                ],
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            const lowStockThreshold = product.stocks?.[0]?.lowStockThreshold || null;

            return res.status(200).json({
                success: true,
                message: "Total stock fetched successfully",
                data: {
                    productId: product.id,
                    productName: product.productName,
                    totalStock: product.totalStock,
                    lowStockThreshold,
                },
            });

        } catch (error) {
            console.error("Error fetching total stock:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch total stock",
            });
        }
    },

    async getStockDocuments(req, res) {
        try {
            const { stockId } = req.params;

            const stock = await ProductStock.findOne({
                where: { id: stockId },
                include: [
                    {
                        model: ProductStockDocument,
                        as: "documents",
                        attributes: ["id", "document", "documentName", "documentContentType", "createdAt"],
                    },
                ],
            });

            if (!stock || stock.documents.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No documents found for this stock",
                });
            }

            const documents = stock.documents.map(doc => ({
                id: doc.id,
                documentName: doc.documentName,
                document: doc.document
                    ? `data:${doc.documentContentType};base64,${doc.document.toString("base64")}`
                    : null,
                documentContentType: doc.documentContentType,
                createdAt: doc.createdAt,
            }));

            return res.status(200).json({
                success: true,
                message: "Documents fetched successfully",
                data: documents,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch documents"
            });
        }
    },

    async deleteStock(req, res) {
        try {
            const { stockId } = req.params;

            if (!stockId) {
                return res.status(400).json({ success: false, message: "Stock Id is required" });
            }

            const stock = await ProductStock.findOne({
                where: { stockId },
                include: [{ model: ProductStockDocument, as: "documents" }]
            });

            if (!stock) {
                return res.status(404).json({
                    success: false,
                    message: "Stock not found"
                });
            }

            if (stock.documents && stock.documents.length > 0) {
                await ProductStockDocument.destroy({
                    where: { stockId: stock.id }
                });
            }
            await ProductStock.destroy({
                where: { stockId }
            });

            return res.status(200).json({
                success: true,
                message: "Stock deleted successfully"
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete stock"
            });
        }
    },
};

module.exports = ProductStockController;
