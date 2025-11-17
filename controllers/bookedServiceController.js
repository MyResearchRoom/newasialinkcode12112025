const { where } = require("sequelize");
const { User, CustomerAddresses, Service, BookedService, BookedServiceItem, BookedServiceItemImage, EstimationDocument, ServiceProcessDetail, ServiceTrack, sequelize } = require("../models")
const generateBookingServiceId = require("../utils/generateBookingServiceId")

const BookedServiceController = {

    async bookService(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const userId = req.user.id;
            let { addressId, preferredServiceDate, pickupRequired, pickupDate, pickupTimeSlot, additionalNotes, items } = req.body;

            if (typeof items === "string") {
                try { items = JSON.parse(items); }
                catch {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid items format"
                    });
                }
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one service item is required."
                });
            }

            for (let item of items) {
                const serviceRecord = await Service.findOne({ where: { id: Number(item.serviceId) } });
                if (!serviceRecord) return res.status(400).json({ success: false, message: `Service not found for ID: ${item.serviceId}` });
                item.serviceId = serviceRecord.id;
                item.noOfDevices = Number(item.noOfDevices) || 1;
                item.issueStartDate = new Date(item.issueStartDate);
            }

            const bookedServiceId = await generateBookingServiceId();

            const bookedService = await BookedService.create({
                bookedServiceId,
                userId,
                addressId,
                preferredServiceDate: new Date(preferredServiceDate),
                pickupRequired: pickupRequired === 'true' || pickupRequired === true,
                pickupDate: pickupDate ? new Date(pickupDate) : null,
                pickupTimeSlot: pickupTimeSlot || null,
                additionalNotes: additionalNotes || null
            }, { transaction });

            //old
            // const allFiles = req.files || [];
            // let fileIndex = 0;

            // for (let item of items) {
            //     const bookedItem = await BookedServiceItem.create({
            //         bookedServiceId: bookedService.bookedServiceId,
            //         serviceId: item.serviceId,
            //         deviceType: item.deviceType,
            //         brandName: item.brandName,
            //         modelNumber: item.modelNumber,
            //         warranty: item.warranty,
            //         noOfDevices: item.noOfDevices,
            //         issueStartDate: item.issueStartDate,
            //         problemDescription: item.problemDescription
            //     }, { transaction });

            //     const noOfFilesForThisItem = Number(item.noOfDevices) || 1;

            //     for (let i = 0; i < noOfFilesForThisItem && fileIndex < allFiles.length; i++) {
            //         const file = allFiles[fileIndex++];
            //         await BookedServiceItemImage.create({
            //             bookedServiceItemId: bookedItem.id,
            //             image: file.buffer,
            //             imageContentType: file.mimetype
            //         }, { transaction });
            //     }
            // }


            const files = req.files || [];

            for (let index = 0; index < items.length; index++) {
                const item = items[index];

                const bookedItem = await BookedServiceItem.create({
                    bookedServiceId: bookedService.bookedServiceId,
                    serviceId: item.serviceId,
                    deviceType: item.deviceType,
                    brandName: item.brandName,
                    modelNumber: item.modelNumber,
                    warranty: item.warranty,
                    noOfDevices: item.noOfDevices,
                    issueStartDate: item.issueStartDate,
                    problemDescription: item.problemDescription
                }, { transaction });

                const filesForThisItem = files.filter(f => f.fieldname === `image[${index}]`);

                for (let file of filesForThisItem.slice(0, 5)) {
                    await BookedServiceItemImage.create({
                        bookedServiceItemId: bookedItem.id,
                        image: file.buffer,
                        imageContentType: file.mimetype
                    }, { transaction });
                }
            }

            await transaction.commit();

            await ServiceTrack.create({
                bookedServiceId,
                status: "Request Received",
                notes: "",
                createdAt: new Date()
            });

            return res.status(201).json({
                success: true,
                message: "Service booked successfully",
                bookedServiceId
            });

        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({
                success: false,
                message: "Failed to book service"
            });
        }
    },

    async getBookedServiceForCustomers(req, res) {
        try {
            const userId = req.user.id;

            const services = await BookedService.findAll({
                where: { userId },
                attributes: ["bookedServiceId", "createdAt", "status", "reason"]
            });

            return res.status(200).json({
                success: true,
                message: "Booked services fetched successfully",
                data: services
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get booked services"
            });
        }
    },

    //api for pending, accepted and rejected request
    async getBookedServices(req, res) {
        try {

            const { page = 1, limit = 10, status } = req.query;
            const offset = (page - 1) * limit;

            const validStatuses = ["pending", "accepted", "rejected", "completed"];
            const whereClause = {};

            if (status && validStatuses.includes(status.toLowerCase())) {
                whereClause.status = status.toLowerCase();
            }

            const { rows: bookedServices, count: totalRecords } = await BookedService.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: BookedServiceItem,
                        as: "items",
                        include: [
                            {
                                model: Service,
                                as: "service",
                                attributes: ["id", "serviceName", "description", "price"],
                            },
                            {
                                model: BookedServiceItemImage,
                                as: "images",
                                attributes: ["id", "image", "imageContentType"],
                            }
                        ]
                    },
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "name", "email", "mobileNumber"]
                    },
                    {
                        model: CustomerAddresses,
                        as: "address",
                        attributes: ["id", "flatNo", "buildingBlock", "floor", "buildingName", "streetName", "landmark", "city", "state", "pincode"]
                    }
                ],
                order: [
                    ["createdAt", "DESC"],
                    [{ model: BookedServiceItem, as: "items" }, "createdAt", "DESC"]
                ],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
                distinct: true
            });

            const result = bookedServices.map(service => {
                const items = service.items.map(item => {
                    const images = item.images.map(img => ({
                        id: img.id,
                        image: `data:${img.imageContentType};base64,${img.image.toString("base64")}`
                    }));
                    return { ...item.toJSON(), images };
                });
                return { ...service.toJSON(), items };
            });


            return res.status(200).json({
                success: true,
                message: "Booked services fetched successfully",
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(totalRecords / limit),
                totalRecords,
                data: result
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch booked services"
            });
        }
    },

    async getBookedServiceDetails(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "Booked Service ID is required"
                });
            }

            const bookedService = await BookedService.findOne({
                where: { bookedServiceId },
                include: [
                    {
                        model: BookedServiceItem,
                        as: "items",
                        include: [
                            {
                                model: Service,
                                as: "service",
                                attributes: ["id", "serviceName", "description", "price"]
                            },
                            {
                                model: BookedServiceItemImage,
                                as: "images",
                                attributes: ["id", "image", "imageContentType"]
                            }
                        ]
                    },
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "name", "email", "mobileNumber"]
                    },
                    {
                        model: CustomerAddresses,
                        as: "address",
                        attributes: ["id", "flatNo", "buildingBlock", "floor", "buildingName", "streetName", "landmark", "city", "state", "pincode"]
                    }
                ]
            });

            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found"
                });
            }

            const items = bookedService.items.map(item => {
                const images = item.images.map(img => ({
                    id: img.id,
                    mediaContentType: img.imageContentType,
                    media: `data:${img.imageContentType};base64,${img.image.toString("base64")}`
                }));

                const estimatedCost = item.service?.price || 0;
                const numberOfDevices = item.numberOfDevices || 1;
                const totalServiceCost = estimatedCost * numberOfDevices;

                return {
                    ...item.toJSON(),
                    images,
                    totalServiceCost
                };
            });

            return res.status(200).json({
                success: true,
                message: "Booked service details fetched successfully",
                data: { ...bookedService.toJSON(), items }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch booked service"
            });
        }
    },

    async getBookedServiceItemImages(req, res) {
        try {
            const { bookedServiceItemId } = req.params;

            if (!bookedServiceItemId) {
                return res.status(400).json({
                    success: false,
                    message: "Booked service item id is required."
                });
            }

            const item = await BookedServiceItem.findOne({
                where: { id: bookedServiceItemId },
                include: [
                    {
                        model: BookedServiceItemImage,
                        as: "images",
                        attributes: ["id", "image", "imageContentType"]
                    }
                ]
            });

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service item not found."
                });
            }

            const images = item.images.map(img => ({
                id: img.id,
                image: `data:${img.imageContentType};base64,${img.image.toString("base64")}`
            }));

            return res.status(200).json({
                success: true,
                message: "Images fetched successfully",
                data: images
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch images"
            });
        }
    },

    async acceptRequest(req, res) {
        try {
            const { bookedServiceId } = req.params;
            const { reason } = req.body;

            if (!bookedServiceId) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service id is required."
                });
            }

            const bookedService = await BookedService.findOne({
                where: { bookedServiceId }
            })

            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found"
                });
            }

            if (bookedService.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: `Request is already ${bookedService.status}`
                });
            }

            bookedService.status = "accepted";
            bookedService.reason = reason || null
            await bookedService.save();

            await ServiceTrack.create({
                bookedServiceId: bookedService.bookedServiceId,
                status: "Request accepted",
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Request accepted successfully",
                data: bookedService.bookedServiceId
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to accept request"
            })
        }
    },

    async rejectRequest(req, res) {
        try {
            const { bookedServiceId } = req.params;
            const { reason } = req.body;

            if (!bookedServiceId) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service id is required."
                });
            }

            const bookedService = await BookedService.findOne({
                where: { bookedServiceId }
            })

            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found"
                });
            }

            // if (bookedService.status !== "pending") {
            //     return res.status(400).json({
            //         success: false,
            //         message: `Request is already ${bookedService.status}`
            //     });
            // }

            bookedService.status = "rejected";
            bookedService.reason = reason || null
            await bookedService.save();

            await ServiceTrack.create({
                bookedServiceId: bookedService.bookedServiceId,
                status: "Request rejected",
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Request rejected successfully",
                data: bookedService.bookedServiceId
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to reject request"
            })
        }
    },

    async createEstimation(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { bookedServiceId } = req.params;
            let { items, discountPercent = 0, estimationNotes } = req.body;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "Booked Service ID is required"
                });
            }

            if (!items) {
                return res.status(400).json({
                    success: false,
                    message: "Items are required"
                });
            }

            if (typeof items === "string") {
                items = items.trim();
                if (items) {
                    try {
                        items = JSON.parse(items);
                    } catch (err) {
                        return res.status(400).json({ success: false, message: "Invalid items format" });
                    }
                } else {
                    items = [];
                }
            }

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ success: false, message: "Items must be a non-empty array" });
            }

            const bookedService = await BookedService.findOne({
                where: { bookedServiceId },
                include: [{ model: BookedServiceItem, as: "items" }]
            });

            if (!bookedService) {
                return res.status(404).json({ success: false, message: "Booked service not found" });
            }

            let totalCost = 0;

            for (const itemEstimation of items) {
                const { id, estimatedCost, estimatedDays } = itemEstimation;
                const bookedItem = bookedService.items.find(i => i.id === id);
                if (!bookedItem) continue;

                bookedItem.estimatedCost = parseFloat(estimatedCost) || 0;
                bookedItem.estimatedDays = parseInt(estimatedDays, 10) || 0;

                totalCost += bookedItem.estimatedCost * bookedItem.noOfDevices;

                await bookedItem.save({ transaction });
            }

            bookedService.discountPercent = parseFloat(discountPercent) || 0;
            bookedService.totalCost = totalCost;
            bookedService.finalCost = totalCost - (totalCost * bookedService.discountPercent / 100);
            bookedService.estimationNotes = estimationNotes;
            bookedService.clientStatus = "pending";

            await bookedService.save({ transaction });

            if (req.files && req.files.documents) {
                const filesArray = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];

                if (filesArray.length > 5) {
                    return res.status(400).json({ success: false, message: "You can upload a maximum of 5 documents only" });
                }

                const documentsData = filesArray.map(file => ({
                    bookedServiceId: bookedService.bookedServiceId,
                    document: file.buffer,
                    documentContentType: file.mimetype,
                    documentName: file.originalname
                }));

                if (documentsData.length) {
                    await EstimationDocument.bulkCreate(documentsData, { transaction });
                }
            }

            await transaction.commit();

            await ServiceTrack.create({
                bookedServiceId: bookedService.bookedServiceId,
                status: "Estimation received",
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Estimation created successfully",
                data: {
                    bookedServiceId: bookedService.bookedServiceId,
                    totalCost: bookedService.totalCost,
                    discountPercent: bookedService.discountPercent,
                    finalCost: bookedService.finalCost,
                    estimationNotes: bookedService.estimationNotes
                }
            });

        } catch (error) {
            await transaction.rollback();
            return res.status(500).json({
                success: false,
                message: "Failed to create estimation"
            });
        }
    },

    //final working api
    async editEstimation(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { bookedServiceId } = req.params;
            let { items, discountPercent, estimationNotes } = req.body;

            if (typeof items === "string") {
                try {
                    items = JSON.parse(items);
                } catch (e) {
                    return res
                        .status(400)
                        .json({ success: false, message: "Invalid items format" });
                }
            }

            if (!bookedServiceId) {
                return res
                    .status(400)
                    .json({ success: false, message: "Booked Service ID is required" });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res
                    .status(400)
                    .json({ success: false, message: "Items are required" });
            }

            const bookedService = await BookedService.findOne({
                where: { bookedServiceId },
                include: [
                    {
                        model: BookedServiceItem,
                        as: "items",
                    },
                ],
            });

            if (!bookedService) {
                return res
                    .status(404)
                    .json({ success: false, message: "Booked service not found" });
            }

            if (!["pending", "rejected"].includes(bookedService.clientApprovalStatus)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Estimation can only be edited if client has rejected the estimation",
                });
            }

            let totalCost = 0;
            for (const itemUpdate of items) {
                const { id, estimatedCost, estimatedDays } = itemUpdate;

                const bookedItem = bookedService.items.find((i) => i.id === id);
                if (!bookedItem) continue;

                bookedItem.estimatedCost = parseFloat(estimatedCost) || 0;
                bookedItem.estimatedDays = parseInt(estimatedDays, 10) || 0;

                const itemTotal = bookedItem.estimatedCost * bookedItem.noOfDevices;
                totalCost += itemTotal;

                await bookedItem.save({ transaction });
            }

            if (discountPercent !== undefined) {
                bookedService.discountPercent = parseFloat(discountPercent) || 0;
            }

            bookedService.totalCost = totalCost;
            bookedService.finalCost =
                totalCost - (totalCost * (bookedService.discountPercent || 0)) / 100;
            bookedService.estimationNotes = estimationNotes;

            if (req.files && req.files.documents) {
                const filesArray = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];

                if (filesArray.length > 5) {
                    return res.status(400).json({ success: false, message: "You can upload a maximum of 5 documents only" });
                }

                const documentsData = filesArray.map(file => ({
                    bookedServiceId: bookedService.bookedServiceId,
                    document: file.buffer,
                    documentContentType: file.mimetype,
                    documentName: file.originalname
                }));

                if (documentsData.length) {
                    await EstimationDocument.bulkCreate(documentsData, { transaction });
                }
            }

            await bookedService.save({ transaction });
            await transaction.commit();

            await ServiceTrack.create({
                bookedServiceId: bookedService.bookedServiceId,
                status: "Updated Estimation received",
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Estimation updated successfully",
                data: {
                    bookedServiceId: bookedService.bookedServiceId,
                    totalCost: bookedService.totalCost,
                    discountPercent: bookedService.discountPercent,
                    finalCost: bookedService.finalCost,
                },
            });
        } catch (error) {
            await transaction.rollback();
            return res
                .status(500)
                .json({ success: false, message: "Failed to edit estimation" });
        }
    },

    //done by customer
    async respondEstimation(req, res) {
        try {
            const { bookedServiceId } = req.params;
            const { clientApprovalStatus, clientApprovalReason } = req.body;

            if (!bookedServiceId || !["approved", "rejected"].includes(clientApprovalStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid request"
                });
            }

            const bookedService = await BookedService.findOne({ where: { bookedServiceId } });
            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found"
                });
            }

            // if (bookedService.clientApprovalStatus !== "pending") {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Estimation already responded"
            //     });
            // }

            bookedService.clientApprovalStatus = clientApprovalStatus;
            bookedService.clientApprovalReason = clientApprovalReason;
            await bookedService.save();

            const statusMessage = clientApprovalStatus === "approved" ? "Estimation Approved" : "Estimation Rejected";

            await ServiceTrack.create({
                bookedServiceId: bookedService.bookedServiceId,
                status: statusMessage,
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: `Estimation ${clientApprovalStatus} successfully`,
                data: bookedServiceId
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to update status"
            })
        }
    },

    async getEstimation(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "Booked Service ID is required"
                });
            }

            const bookedService = await BookedService.findOne({
                where: { bookedServiceId },
                include: [
                    {
                        model: BookedServiceItem,
                        as: "items",
                        attributes: ["id", "deviceType", "brandName", "modelNumber", "noOfDevices", "problemDescription", "estimatedCost", "estimatedDays"],
                        include: [
                            {
                                model: Service,
                                as: "service",
                                attributes: ["id", "serviceName",]
                            }
                        ]
                    },
                    {
                        model: EstimationDocument,
                        as: "documents",
                        attributes: ["id", "documentName", "documentContentType", "document"]
                    }
                ]
            });

            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found"
                });
            }

            const itemsWithEstimation = bookedService.items.map(item => ({
                id: item.id,
                serviceId: item.serviceId,
                serviceName: item.service.serviceName,
                deviceType: item.deviceType,
                brandName: item.brandName,
                modelNumber: item.modelNumber,
                noOfDevices: item.noOfDevices,
                problemDescription: item.problemDescription,
                estimationNotes: item.estimationNotes,
                estimatedCost: parseFloat(item.estimatedCost) || 0,
                estimatedDays: item.estimatedDays || 0,
                itemTotal: (parseFloat(item.estimatedCost) || 0) * (item.noOfDevices || 0),
            }));

            const documents = bookedService.documents.map(doc => ({
                id: doc.id,
                documentName: doc.documentName,
                document: `data:${doc.documentContentType};base64,${doc.document.toString("base64")}`
            }));

            return res.status(200).json({
                success: true,
                message: "Estimation fetched successfully",
                data: {
                    bookedServiceId: bookedService.bookedServiceId,
                    reason: bookedService.reason,
                    clientApprovalReason: bookedService.clientApprovalReason,
                    clientApprovalStatus: bookedService.clientApprovalStatus,
                    estimationNotes: bookedService.estimationNotes,
                    discountPercent: parseFloat(bookedService.discountPercent) || 0,
                    totalCost: parseFloat(bookedService.totalCost) || 0,
                    finalCost: parseFloat(bookedService.finalCost) || 0,
                    items: itemsWithEstimation,
                    documents
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch estimation"
            });
        }
    },

    async assignPickup(req, res) {
        try {
            const { bookedServiceId } = req.params;
            const { pickupPersonId, scheduledPickupDate } = req.body;

            // if (!pickupPersonId || !scheduledPickupDate) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "pickupPersonId and scheduledPickupDate are required"
            //     });
            // }

            const bookedService = await BookedService.findOne({
                where: { bookedServiceId },
            });

            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found"
                });
            }

            if (bookedService.clientApprovalStatus !== "approved") {
                return res.status(400).json({
                    success: false,
                    message: "Pickup person can only be assigned after customer's approval for estimation"
                });
            }

            bookedService.pickupPersonId = pickupPersonId;
            bookedService.scheduledPickupDate = scheduledPickupDate;

            bookedService.currentStep = "pickup"
            await bookedService.save();

            const pickupPerson = await User.findByPk(pickupPersonId, {
                attributes: ["id", "name", "email", "mobileNumber"]
            });

            await ServiceTrack.create({
                bookedServiceId: bookedService.bookedServiceId,
                status: "Pickup assigned",
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Pickup person assigned successfully",
                data: {
                    bookedServiceId: bookedService.bookedServiceId,
                    pickupPerson: pickupPerson,
                    scheduledPickupDate: bookedService.scheduledPickupDate
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to asssign pickup"
            })
        }
    },

    //for customer
    async cancelRequest(req, res) {
        try {
            const userId = req.user.id;
            const { bookedServiceId } = req.params;
            const { reason } = req.body;

            if (!bookedServiceId) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service id is required."
                });
            }

            const bookedService = await BookedService.findOne({
                where: { bookedServiceId, userId }
            })

            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found"
                });
            }

            if (bookedService.status !== "pending") {
                return res.status(400).json({
                    success: false,
                    message: `You can only cancel pending request`
                });
            }

            bookedService.status = "cancelled";
            bookedService.reason = reason || null
            await bookedService.save();

            await ServiceTrack.create({
                bookedServiceId: bookedService.bookedServiceId,
                status: "Request Cancelled by you",
                notes: "",
                createdAt: new Date()
            });


            return res.status(200).json({
                success: true,
                message: "Request cancelled successfully",
                data: bookedService.bookedServiceId
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to cancel request"
            })
        }
    },

    //api for admin side
    async trackBookedService(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "Booked Service ID is required",
                });
            }

            const bookedService = await BookedService.findOne({
                where: { bookedServiceId },
                attributes: ["bookedServiceId", "currentStep"],
            });

            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found",
                });
            }

            const steps = ["details", "estimation", "pickup", "process", "completed"];
            const currentIndex = steps.indexOf(bookedService.currentStep);

            const completedSteps = steps.map((step, index) => ({
                name: step,
                completed: index <= currentIndex,
            }));

            return res.status(200).json({
                success: true,
                message: "Booked service progress fetched successfully",
                data: {
                    bookedServiceId: bookedService.bookedServiceId,
                    currentStep: bookedService.currentStep,
                    completedSteps,
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch booked service progress",
            });
        }
    },

    //customer side
    async trackBookedServiceCustomer(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "Booked Service ID is required"
                });
            }

            const trackBookedService = await ServiceTrack.findAll({
                where: { bookedServiceId },
                attributes: ["bookedServiceId", "status", "createdAt"],
            });

            if (!trackBookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Service tracked successfully",
                data: trackBookedService
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to track service"
            });
        }
    },

}

module.exports = BookedServiceController