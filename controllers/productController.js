const { Op, where, Sequelize } = require("sequelize");
const { User, Category, Product, ProductImage, ProductStock, ProductReview } = require("../models")

const ProductController = {

    async createProduct(req, res) {
        try {
            const {
                productName,
                model,
                categoryId,
                description,
                originalPrice,
                discountPercent,
                gstPercent,
                handlingCharges,
                screenSize,
                cpuModel,
                ram,
                operatingSystem,
                specialFeature,
                graphicsCard,
                displaySections = [],
                specifications = {},
                configurations = {},
                colors = [],
                sizes = [],
                moreDetails = {},
            } = req.body;

            const gstPrice = (parseFloat(originalPrice) * parseFloat(gstPercent) / 100).toFixed(2);
            const discountedPrice = parseFloat(originalPrice) - (parseFloat(originalPrice) * parseFloat(discountPercent) / 100);

            const parseField = (field, defaultValue) => {
                if (!field) return defaultValue;
                if (typeof field === "string") {
                    try {
                        return JSON.parse(field);
                    } catch {
                        return defaultValue;
                    }
                }
                return field;
            };

            const product = await Product.create({
                productName,
                model,
                categoryId,
                description,
                originalPrice,
                discountPercent,
                discountedPrice,
                gstPercent,
                gstPrice,
                handlingCharges,
                screenSize,
                cpuModel,
                ram,
                operatingSystem,
                specialFeature,
                graphicsCard,
                displaySections: parseField(displaySections, []),
                specifications: parseField(specifications, {}),
                configurations: parseField(configurations, {}),
                colors: parseField(colors, []),
                sizes: parseField(sizes, []),
                moreDetails: parseField(moreDetails, {}),
                isBlock: false,
            });

            if (req.files && req.files.images) {
                if (req.files.images.length > 5) {
                    return res.status(400).json({
                        success: false,
                        message: "You can upload a maximum of 5 images only",
                    });
                }

                const imagesData = req.files.images.map(file => ({
                    productId: product.id,
                    image: file.buffer,
                    imageContentType: file.mimetype,
                }));

                if (imagesData.length) await ProductImage.bulkCreate(imagesData);
            }

            return res.status(200).json({
                success: true,
                message: "Product created successfully.",
                data: product
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to create product"
            });
        }
    },

    async editProduct(req, res) {
        try {
            const {
                productName,
                model,
                categoryId,
                description,
                originalPrice,
                discountPercent,
                discountedPrice,
                gstPercent,
                gstPrice,
                handlingCharges,
                screenSize,
                cpuModel,
                ram,
                operatingSystem,
                specialFeature,
                graphicsCard,
                displaySections = [],
                specifications = {},
                configurations = {},
                colors = [],
                sizes = [],
                moreDetails = {},
            } = req.body;

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Id is required"
                });
            }

            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                })
            }

            const parseField = (field, defaultValue) => {
                if (!field) return defaultValue;
                if (typeof field === "string") {
                    try {
                        return JSON.parse(field);
                    } catch {
                        return defaultValue;
                    }
                }
                return field;
            };

            await product.update({
                productName,
                model,
                categoryId,
                description,
                originalPrice,
                discountPercent,
                discountedPrice,
                gstPercent,
                gstPrice,
                handlingCharges,
                screenSize,
                cpuModel,
                ram,
                operatingSystem,
                specialFeature,
                graphicsCard,
                displaySections: parseField(displaySections, []),
                specifications: parseField(specifications, {}),
                configurations: parseField(configurations, {}),
                colors: parseField(colors, []),
                sizes: parseField(sizes, []),
                moreDetails: parseField(moreDetails, {}),
            });

            if (req.files && req.files.images) {
                if (req.files.images.length > 5) {
                    return res.status(400).json({
                        success: false,
                        message: "You can upload a maximum of 5 images only",
                    });
                }

                await ProductImage.destroy({
                    where: { productId: product.id }
                });

                const imagesData = req.files.images.map(file => ({
                    productId: product.id,
                    image: file.buffer,
                    imageContentType: file.mimetype,
                }));

                if (imagesData.length) await ProductImage.bulkCreate(imagesData);
            }

            return res.status(200).json({
                success: true,
                message: "Product updated successfully.",
                data: product,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to update product",
            });
        }
    },

    async getProductList(req, res) {
        try {
            const { page = 1, limit = 10, search = "", displaySection, role } = req.query;
            const offset = (page - 1) * limit;



            let whereCondition = {};
            if (search) {
                whereCondition[Op.or] = [
                    // { "$category.name$": { [Op.like]: `%${search}%` } },
                    { productName: { [Op.like]: `%${search}%` } },
                    { model: { [Op.like]: `%${search}%` } },
                ];
            }

            if (displaySection) {
                whereCondition[Op.and] = Sequelize.literal(
                    `JSON_CONTAINS(displaySections, '"${displaySection}"')`
                );
            }

            if (!role || !["ADMIN", "PRODUCT_MANAGER"].includes(role.toUpperCase())) {
                whereCondition.isBlock = false;
            }

            const { rows: products, count: totalRecords } = await Product.findAndCountAll({
                where: whereCondition,
                attributes: ["id", "productName", "model", "originalPrice", "discountPercent", "discountedPrice", "categoryId", "displaySections", "totalStock"],
                include: [
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "name"],
                        required: true,
                    },
                    {
                        model: ProductImage,
                        as: "images",
                        attributes: ["id", "image", "imageContentType"],
                    }
                ],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
                distinct: true
            });

            const formattedProducts = products.map(product => {
                const images = product.images.map(img => ({
                    id: img.id,
                    image: `data:${img.imageContentType};base64,${img.image.toString("base64")}`
                }));

                return {
                    ...product.toJSON(),
                    images,
                };
            });

            return res.status(200).json({
                success: true,
                message: "Product List fetched successfully",
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(totalRecords / 10),
                totalRecords,
                data: formattedProducts
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Faield to fetch product list"
            })
        }
    },

    async getProductDetails(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Id is required"
                });
            }

            const parseJson = (value) => {
                if (typeof value === "string") {
                    try {
                        return JSON.parse(value);
                    } catch {
                        return value;
                    }
                }
                return value;
            };

            const product = await Product.findByPk(id, {
                include: [
                    {
                        model: ProductImage,
                        as: "images",
                        attributes: ["id", "image", "imageContentType"],
                    },
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "name"],
                    },
                    {
                        model: ProductStock,
                        as: "stocks",
                        attributes: ["id", "currentStock", "lowStockThreshold", "createdAt"],
                        order: [["createdAt", "DESC"]],
                        limit: 1
                    },
                    {
                        model: ProductReview,
                        as: "reviews",
                        include: [
                            {
                                model: User,
                                as: "user",
                                attributes: ["id", "name"]
                            }
                        ],
                        attributes: ["id", "rating", "review", "createdAt"]
                    }
                ],
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            const productData = product.toJSON();

            productData.images = productData.images.map(img => ({
                id: img.id,
                image: img.image ? `data:${img.imageContentType};base64,${img.image.toString("base64")}` : null,
            }));

            productData.displaySections = parseJson(productData.displaySections);
            productData.specifications = parseJson(productData.specifications);
            productData.configurations = parseJson(productData.configurations);
            productData.colors = parseJson(productData.colors);
            productData.sizes = parseJson(productData.sizes);
            productData.moreDetails = parseJson(productData.moreDetails);

            if (productData.stocks && productData.stocks.length > 0) {
                const latestStock = productData.stocks[0];
                const currentStock = Number(latestStock.currentStock);
                const lowStockThreshold = Number(latestStock.lowStockThreshold);

                let status = "inStock";
                if (currentStock === 0) status = "outOfStock";
                else if (currentStock <= lowStockThreshold) status = "lowStock";

                productData.stockStatus = status;
                productData.currentStock = currentStock;
            } else {
                productData.stockStatus = "noStockData";
                productData.currentStock = null;
            }

            if (productData.reviews && productData.reviews.length > 0) {
                const totalRatings = productData.reviews.reduce((sum, review) => sum + review.rating, 0);
                productData.averageRating = parseFloat((totalRatings / productData.reviews.length).toFixed(2));
            } else {
                productData.averageRating = 0;
            }

            return res.status(200).json({
                success: true,
                message: "Product details fetched successfully",
                data: productData,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch product details",
            });
        }
    },

    async getProductsByCategory(req, res) {
        try {
            const { categoryId } = req.params;

            if (!categoryId) {
                return res.status(400).json({
                    success: false,
                    message: "Category ID is required"
                });
            }

            const products = await Product.findAll({
                where: { categoryId },
                attributes: ["id", "productName", "model"],
                include: [
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "name"]
                    }
                ],
            });

            return res.status(200).json({
                success: true,
                message: "Products fetched successfully",
                data: products
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch products"
            });
        }
    },

    async blockProduct(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ success: false, message: "Id is required" });
            }

            const product = await Product.findByPk(id)
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "Product not found"
                });
            }

            product.isBlock = !product.isBlock;
            await product.save();

            return res.status(200).json({
                success: true,
                message: `Product ${product.isBlock ? "blocked" : "unblocked"} successfully`,
                data: {
                    id: product.id,
                    productName: product.productName,
                    isBlock: product.isBlock
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to block/unblock product"
            });
        }
    },

    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ success: false, message: "Id is required" });
            }

            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            await product.destroy();

            return res.status(200).json({
                success: true,
                message: "Product deleted successfully"
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete product"
            });
        }
    },

}

module.exports = ProductController