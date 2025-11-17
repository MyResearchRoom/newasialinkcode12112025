const { Op, Sequelize } = require("sequelize");
const { Service, ServiceImage } = require("../models");

const ServiceController = {

    async createService(req, res) {
        try {
            const {
                serviceName,
                price,
                oldPrice,
                discountPercent,
                description,
                displaySections = [],
                serviceType = [],
                moreInfo = {},
            } = req.body;


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

            const service = await Service.create({
                serviceName,
                price,
                oldPrice,
                discountPercent,
                description,
                displaySections: parseField(displaySections, []),
                serviceType: parseField(serviceType, []),
                moreInfo: parseField(moreInfo, {}),
            });

            if (req.files && req.files.images) {
                if (req.files.images.length > 5) {
                    return res.status(400).json({
                        success: false,
                        message: "You can upload a maximum of 5 images only",
                    });
                }

                const imagesData = req.files.images.map(file => ({
                    serviceId: service.id,
                    image: file.buffer,
                    imageContentType: file.mimetype,
                }));
                if (imagesData.length) await ServiceImage.bulkCreate(imagesData);
            }

            return res.status(200).json({
                success: true,
                message: "Service created successfully.",
                data: service
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to create service"
            });
        }
    },

    async editService(req, res) {
        try {
            const {
                serviceName,
                price,
                oldPrice,
                discountPercent,
                description,
                displaySections = [],
                serviceType = [],
                moreInfo = {},
            } = req.body;

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ success: false, message: "Id is required" });
            }

            const service = await Service.findByPk(id);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found",
                });
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

            await service.update({
                serviceName,
                price,
                oldPrice,
                discountPercent,
                description,
                displaySections: parseField(displaySections, []),
                serviceType: parseField(serviceType, []),
                moreInfo: parseField(moreInfo, {}),
            });

            if (req.files && req.files.images) {
                if (req.files.images.length > 5) {
                    return res.status(400).json({
                        success: false,
                        message: "You can upload a maximum of 5 images only",
                    });
                }

                await ServiceImage.destroy({ where: { serviceId: service.id } });

                const imagesData = req.files.images.map((file) => ({
                    serviceId: service.id,
                    image: file.buffer,
                    imageContentType: file.mimetype,
                }));

                if (imagesData.length) await ServiceImage.bulkCreate(imagesData);
            }

            return res.status(200).json({
                success: true,
                message: "Service updated successfully.",
                data: service,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to update service",
            });
        }
    },

    async getServiceList(req, res) {
        try {
            const { page = 1, limit = 10, search = "", displaySection, role } = req.query;
            const offset = (page - 1) * limit;

            const whereCondition = search ? {
                [Op.or]: [
                    { serviceName: { [Op.like]: `%${search}%` } },
                ],
            }
                : {};

            if (displaySection) {
                whereCondition[Op.and] = [
                    ...(whereCondition[Op.and] || []),
                    Sequelize.literal(`JSON_CONTAINS(displaySections, '["${displaySection}"]')`)
                ];
            }

            if (!role || !["ADMIN", "SERVICE_MANAGER"].includes(role.toUpperCase())) {
                whereCondition.isBlock = false;
            }

            const { rows: services, count: totalRecords } = await Service.findAndCountAll({
                where: whereCondition,
                attributes: ["id", "serviceName", "price", "oldPrice", "discountPercent", "displaySections", "isBlock"],
                include: [
                    {
                        model: ServiceImage,
                        as: "images",
                        attributes: ["id", "image", "imageContentType"],
                    }
                ],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
                distinct: true
            });

            const formattedServices = services.map(service => {
                const images = service.images.map(img => ({
                    id: img.id,
                    image: `data:${img.imageContentType};base64,${img.image.toString("base64")}`
                }));

                return {
                    ...service.toJSON(),
                    images,
                };
            });

            return res.status(200).json({
                success: true,
                message: "Service List fetched successfully",
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(totalRecords / 10),
                totalRecords,
                data: formattedServices
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Faield to fetch service list"
            })
        }
    },

    async getServiceDetails(req, res) {
        try {
            const { id } = req.params;

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

            const service = await Service.findByPk(id, {
                include: [
                    {
                        model: ServiceImage,
                        as: "images",
                        attributes: ["id", "image", "imageContentType"],
                    }
                ],
            });
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found"
                });
            }

            const serviceData = service.toJSON();

            serviceData.images = serviceData.images.map(img => ({
                id: img.id,
                image: img.image ? `data:${img.imageContentType};base64,${img.image.toString("base64")}` : null
            }));

            serviceData.displaySections = parseJson(serviceData.displaySections);
            serviceData.serviceType = parseJson(serviceData.serviceType);
            serviceData.moreInfo = parseJson(serviceData.moreInfo);


            return res.status(200).json({
                success: true,
                message: "Service details fetched successfully",
                data: serviceData,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch service details"
            });
        }
    },

    async blockService(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ success: false, message: "Id is required" });
            }

            const service = await Service.findByPk(id);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found"
                });
            }

            service.isBlock = !service.isBlock;
            await service.save();

            return res.status(200).json({
                success: true,
                message: `Service ${service.isBlock ? "blocked" : "unblocked"} successfully`,
                data: {
                    id: service.id,
                    serviceName: service.serviceName,
                    isBlock: service.isBlock
                }
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Falied to block/unblock service"
            });
        }
    },

    async deleteService(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ success: false, message: "Id is required" });
            }

            const service = await Service.findByPk(id);
            if (!service) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found"
                });
            }

            await service.destroy();

            return res.status(200).json({
                success: true,
                message: "Service deleted successfully."
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete service"
            });
        }
    },
}

module.exports = ServiceController;