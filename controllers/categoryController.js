const { Op } = require("sequelize");
const { Category } = require("../models")

const categoryController = {

    async createCategory(req, res) {
        try {
            const { name, isBlock } = req.body;

            const existingCategory = await Category.findOne({
                where: { name }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category already exists"
                });
            }

            let image = null;
            let imageContentType = null;

            if (req.file) {
                image = req.file.buffer;
                imageContentType = req.file.mimetype
            }

            const newCategory = await Category.create({
                name,
                image,
                imageContentType,
                isBlock: isBlock !== undefined ? isBlock : false,
            });

            return res.status(200).json({
                success: true,
                message: "Category created successfully",
                data: {
                    id: newCategory.id,
                    name: newCategory.name,
                    image: image
                        ? `data:${imageContentType};base64,${image.toString("base64")}`
                        : null,
                },
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to create category"
            })
        }
    },

    async getCategoryList(req, res) {
        try {

            const { page = 1, limit = 10, search } = req.query;
            const offset = (page - 1) * limit;

            const whereCondition = {};
            if (search) {
                whereCondition.name = { [Op.like]: `%${search}%` };
            }

            const { rows: categories, count: totalRecords } = await Category.findAndCountAll({
                where: whereCondition,
                attributes: ["id", "name", "isBlock", "image", "imageContentType"],
                order: [["createdAt", "DESC"]],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10)
            });

            const categoryList = categories.map(category => ({
                id: category.id,
                name: category.name,
                isBlock: category.isBlock,
                image: category.image ? `data: ${category.imageContentType};base64,${category.image.toString("base64")}` : null,
            }));

            return res.status(200).json({
                success: true,
                message: "Category list fetched successfully",
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(totalRecords / 10),
                totalRecords,
                data: categoryList
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fecth category list"
            });
        }
    },

    async getCategoryDetailsById(req, res) {
        try {
            const { id } = req.params;

            const category = await Category.findOne({
                where: { id },
                attributes: ["id", "name", "isBlock", "image", "imageContentType"]
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

            const categoryData = {
                id: category.id,
                name: category.name,
                isBlock: category.isBlock,
                image: category.image
                    ? `data:${category.imageContentType};base64,${category.image.toString("base64")}`
                    : null,
            };

            return res.status(200).json({
                success: true,
                message: "Category details fetched successfully",
                data: categoryData
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch category details"
            });
        }
    },

    async editCategory(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: "Id is required" });
            }

            const { name, isBlock } = req.body;

            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }

            category.name = name || category.name;
            category.isBlock = isBlock !== undefined ? isBlock : category.isBlock;

            if (req.file) {
                category.image = req.file.buffer;
                category.imageContentType = req.file.mimetype;
            }

            await category.save();

            return res.status(200).json({
                success: true,
                message: "Category updated successfully",
                data: {
                    id: category.id,
                    name: category.name,
                    image: category.image
                        ? `data:${category.imageContentType};base64,${category.image.toString("base64")}`
                        : null,
                    isBlock: category.isBlock,
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to update category"
            });
        }
    },

    async blockCategory(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ success: false, message: "Id is required" });
            }

            const category = await Category.findByPk(id)
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: "Category not found"
                });
            }

            category.isBlock = !category.isBlock;
            await category.save();

            return res.status(200).json({
                success: true,
                message: `Category ${category.isBlock ? "blocked" : "unblocked"} successfully`,
                data: {
                    id: category.id,
                    name: category.name,
                    isBlock: category.isBlock
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to block/unblock category"
            });
        }
    },

    async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ success: false, message: "Id is required" });
            }

            const category = await Category.findByPk(id)
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: "Category not found"
                });
            }

            await category.destroy();

            return res.status(200).json({
                success: true,
                message: "Category deleted successfully"
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete category"
            });
        }
    },
}

module.exports = categoryController;