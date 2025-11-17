const { BookedService, ServiceProcessDetail, ServiceProcessPart, ServiceInvoice, ServiceInvoiceCharge, ServicePayment, ServiceShipmentDetails, ServiceTrack } = require("../models");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber")

const ServiceProcessController = {

    async receiveOrder(req, res) {
        try {
            const { bookedServiceId } = req.params;
            const { stepDate, stepStatus = "completed", statusNotes, partNeeded } = req.body;

            if (!bookedServiceId || !stepDate) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId and stepDate required"
                });
            }

            const step = await ServiceProcessDetail.create({
                bookedServiceId,
                stepName: "orderReceived",
                stepDate,
                stepStatus,
                statusNotes,
                partNeeded,
            });

            const bookedService = await BookedService.findOne({ where: { bookedServiceId } });
            if (bookedService) {
                bookedService.currentStep = "process";
                await bookedService.save();
            }

            return res.status(200).json({
                success: true,
                message: "Order Received Successfully",
                data: step
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to receive order"
            });
        }
    },

    async orderParts(req, res) {
        try {
            const { bookedServiceId } = req.params;
            const { stepStatus = "completed", statusNotes, parts = [] } = req.body;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            const orderReceivedStep = await ServiceProcessDetail.findOne({
                where: { bookedServiceId, stepName: "orderReceived" },
            });

            if (!orderReceivedStep) {
                return res.status(400).json({
                    success: false,
                    message: 'As order is not received parts cannot be ordered.',
                });
            }

            if (!orderReceivedStep.partNeeded) {
                return res.status(400).json({
                    success: false,
                    message: 'Parts cannot be ordered as you have not selected checkbox of parts required.',
                });
            }

            const step = await ServiceProcessDetail.create({
                bookedServiceId,
                stepName: "partOrders",
                stepDate: new Date(),
                stepStatus,
                statusNotes,
            });

            if (parts.length > 0) {
                const partRecords = parts.map((part) => ({
                    serviceProcessId: step.id,
                    partName: part.partName,
                    quantity: part.quantity,
                    price: part.price,
                }));
                await ServiceProcessPart.bulkCreate(partRecords);
            }

            await ServiceTrack.create({
                bookedServiceId,
                status: "Parts Ordered",
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Parts Order placed successfully",
                data: { step, parts },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to place parts order",
            });
        }
    },

    async getOrderedParts(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            const partOrderStep = await ServiceProcessDetail.findOne({
                where: { bookedServiceId, stepName: "partOrders" },
                attributes: ["stepName", "stepDate", "stepStatus", "statusNotes"],
                include: [
                    {
                        model: ServiceProcessPart,
                        as: "parts",
                        attributes: ["id", "partName", "quantity", "price", "createdAt", "updatedAt"]
                    }
                ]
            });

            if (!partOrderStep) {
                return res.status(404).json({
                    success: false,
                    message: "No parts ordered yet for this booked service",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Ordered parts fetched successfully",
                data: {
                    stepName: partOrderStep.stepName,
                    stepDate: partOrderStep.stepDate,
                    stepStatus: partOrderStep.stepStatus,
                    statusNotes: partOrderStep.statusNotes,
                    parts: partOrderStep.parts
                }
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch ordered parts",
            });
        }
    },

    async partsReceived(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            const step = await ServiceProcessDetail.create({
                bookedServiceId,
                stepName: "partReceived",
                stepDate: new Date(),
                stepStatus: "completed",
            });

            await ServiceTrack.create({
                bookedServiceId,
                status: "Parts Received",
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Parts Received step completed successfully",
                data: step,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to complete Part Received step",
            });
        }
    },

    async updateRepairProcess(req, res) {
        try {
            const { bookedServiceId } = req.params;
            const { stepStatus, statusNotes } = req.body;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            if (!stepStatus || !["pending", "inProgress", "completed"].includes(stepStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "stepStatus must be one of pending, inProgress, completed",
                });
            }

            let step = await ServiceProcessDetail.findOne({
                where: { bookedServiceId, stepName: "repairProcess" },
            });

            if (!step) {
                step = await ServiceProcessDetail.create({
                    bookedServiceId,
                    stepName: "repairProcess",
                    stepDate: new Date(),
                    stepStatus,
                    statusNotes,
                });
            } else {
                step.stepStatus = stepStatus;
                step.statusNotes = statusNotes;
                step.stepDate = new Date();
                await step.save();
            }

            if (stepStatus === "inProgress") {
                await ServiceTrack.create({
                    bookedServiceId,
                    status: "Repair in progress",
                    notes: "",
                    createdAt: new Date(),
                });
            }

            if (stepStatus === "completed") {
                await ServiceTrack.create({
                    bookedServiceId,
                    status: "Repair process completed",
                    notes: "",
                    createdAt: new Date(),
                });
            }

            return res.status(200).json({
                success: true,
                message: "Repair process updated successfully",
                data: step,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to update repair process",
            });
        }
    },

    async updateTestingProcess(req, res) {
        try {
            const { bookedServiceId } = req.params;
            const { stepStatus, statusNotes } = req.body;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            if (!stepStatus || !["pending", "inProgress", "completed"].includes(stepStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "stepStatus must be one of pending, inProgress, completed",
                });
            }

            let step = await ServiceProcessDetail.findOne({
                where: { bookedServiceId, stepName: "testing" },
            });

            if (!step) {
                step = await ServiceProcessDetail.create({
                    bookedServiceId,
                    stepName: "testing",
                    stepDate: new Date(),
                    stepStatus,
                    statusNotes,
                });
            } else {
                step.stepStatus = stepStatus;
                step.statusNotes = statusNotes;
                step.stepDate = new Date();
                await step.save();
            }

            if (stepStatus === "inProgress") {
                await ServiceTrack.create({
                    bookedServiceId,
                    status: "Testing in progress",
                    notes: "",
                    createdAt: new Date(),
                });
            }

            if (stepStatus === "completed") {
                await ServiceTrack.create({
                    bookedServiceId,
                    status: "Testing process completed",
                    notes: "",
                    createdAt: new Date(),
                });
            }

            return res.status(200).json({
                success: true,
                message: "Testing process updated successfully",
                data: step,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to update testing process",
            });
        }
    },

    async createInvoice(req, res) {
        try {
            const { bookedServiceId } = req.params;
            const { invoiceDate, additionalCharges = [] } = req.body;

            if (!bookedServiceId || !invoiceDate) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId and invoiceDate are required",
                });
            }

            const bookedService = await BookedService.findOne({ where: { bookedServiceId } });
            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found",
                });
            }

            const invoiceNumber = await generateInvoiceNumber();

            const invoice = await ServiceInvoice.create({
                bookedServiceId,
                invoiceNumber,
                invoiceDate,
                totalAmount: 0,
            });

            let totalAdditionalCharges = 0;
            if (additionalCharges.length > 0) {
                const chargesData = additionalCharges.map((charge) => ({
                    serviceInvoiceId: invoice.id,
                    chargeName: charge.chargeName,
                    chargeAmount: parseFloat(charge.chargeAmount),
                }));

                await ServiceInvoiceCharge.bulkCreate(chargesData);

                totalAdditionalCharges = chargesData.reduce((sum, c) => sum + c.chargeAmount, 0);
            }

            //
            const finalAmount = (parseFloat(bookedService.finalCost) || 0) + totalAdditionalCharges;

            invoice.totalAmount = finalAmount;
            await invoice.save();

            bookedService.finalCost = finalAmount;
            await bookedService.save();

            await ServiceProcessDetail.create({
                bookedServiceId,
                stepName: "invoice",
                stepDate: new Date(),
                stepStatus: "completed",
                statusNotes: "Invoice generated",
            });

            await ServiceTrack.create({
                bookedServiceId,
                status: "Invoice Received",
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Invoice created successfully",
                data: {
                    invoice,
                    additionalCharges,
                    computed: {
                        finalAmount,
                    },
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to create invoice",
            });
        }
    },

    async getAdditionalCharges(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "Booked Service ID is required"
                });
            }

            const invoices = await ServiceInvoice.findAll({
                where: { bookedServiceId },
                include: [
                    {
                        model: ServiceInvoiceCharge,
                        as: "additionalCharges",
                        attributes: ["id", "chargeName", "chargeAmount"]
                    }
                ]
            });

            if (!invoices || invoices.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No invoices or additional charges found for this service"
                });
            }

            const chargesSummary = invoices.map(invoice => ({
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: invoice.invoiceDate,
                totalAmount: invoice.totalAmount,
                additionalCharges: invoice.additionalCharges
            }));

            return res.status(200).json({
                success: true,
                message: "Additional charges fetched successfully",
                data: chargesSummary
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch additional charges"
            });
        }
    },

    async createPayment(req, res) {
        try {
            const { serviceInvoiceId } = req.params;
            const { installmentAmount, paymentMode, paymentDate, transactionRefId } = req.body;

            if (!serviceInvoiceId || !installmentAmount || !paymentMode || !paymentDate) {
                return res.status(400).json({
                    success: false,
                    message: "serviceInvoiceId, installmentAmount, paymentMode and paymentDate are required",
                });
            }

            const invoice = await ServiceInvoice.findByPk(serviceInvoiceId);
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: "Invoice not found"
                });
            }

            const payments = await ServicePayment.findAll({ where: { serviceInvoiceId } });
            const totalPaidSoFar = payments.reduce((sum, p) => sum + parseFloat(p.installmentAmount), 0);

            const payment = await ServicePayment.create({
                serviceInvoiceId,
                installmentAmount,
                paymentMode,
                paymentDate,
                transactionRefId: transactionRefId || null,
            });

            const newTotalPaid = totalPaidSoFar + parseFloat(installmentAmount);

            let paymentStatus = "partial";
            if (newTotalPaid >= parseFloat(invoice.totalAmount)) paymentStatus = "completed";

            await ServicePayment.update({ paymentStatus }, { where: { serviceInvoiceId } });

            await ServiceProcessDetail.create({
                bookedServiceId: invoice.bookedServiceId,
                stepName: "paymentStatus",
                stepDate: new Date(),
                stepStatus: paymentStatus === "completed" ? "completed" : "inProgress",
                statusNotes: `Payment ${paymentStatus} - Amount Paid: ${installmentAmount}`,
            });

            if (paymentStatus === "completed") {
                await ServiceTrack.create({
                    bookedServiceId: invoice.bookedServiceId,
                    status: "Payment Confirm",
                    notes: "",
                    createdAt: new Date()
                });
            }

            return res.status(200).json({
                success: true,
                message: `Payment recorded successfully. Payment status: ${paymentStatus}`,
                data: {
                    serviceInvoiceId,
                    payment,
                    totalPaid: newTotalPaid,
                    totalAmount: invoice.totalAmount,
                    paymentStatus,
                },
            });
        } catch (error) {
            console.log(error);
            
            return res.status(500).json({
                success: false,
                message: "Failed to record payment",
            });
        }
    },

    async getPaymentHistory(req, res) {
        try {
            const { serviceInvoiceId } = req.params;

            if (!serviceInvoiceId) {
                return res.status(400).json({
                    success: false,
                    message: "Service Invoice ID is required",
                });
            }

            const invoice = await ServiceInvoice.findOne({
                where: { id: serviceInvoiceId },
                attributes: ["id", "totalAmount"],
                include: [
                    {
                        model: ServicePayment,
                        as: "payments",
                        attributes: [
                            "id",
                            "installmentAmount",
                            "paymentMode",
                            "paymentDate",
                            "transactionRefId",
                            "paymentStatus",
                            "createdAt"
                        ],
                        order: [["paymentDate", "ASC"]]
                    }
                ]
            });

            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: "Invoice not found",
                });
            }

            const totalPaid = invoice.payments.reduce(
                (sum, p) => sum + parseFloat(p.installmentAmount),
                0
            );

            return res.status(200).json({
                success: true,
                message: "Payment history fetched successfully",
                data: {
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    totalAmount: parseFloat(invoice.totalAmount),
                    totalPaid,
                    paymentStatus: totalPaid >= parseFloat(invoice.totalAmount) ? "completed" : (totalPaid > 0 ? "partial" : "pending"),
                    payments: invoice.payments,
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch payment history",
            });
        }
    },

    async addShippingDetails(req, res) {
        try {
            const { bookedServiceId } = req.params;
            const {
                courierCompanyName,
                trackingId,
                pickUpDate,
                estimatedDeliveryDate,
                shipmentType,
                paymentMode,
                deliveryPersonName,
                deliveryPersonNumber,
                pickupLocation,
                deliveryAddress,
            } = req.body;

            if (!bookedServiceId || !pickUpDate || !estimatedDeliveryDate || !paymentMode || !pickupLocation || !deliveryAddress) {
                return res.status(400).json({
                    success: false,
                    message: "Required fields are missing"
                });
            }

            const bookedService = await BookedService.findOne({ where: { bookedServiceId } });
            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found"
                });
            }

            if (courierCompanyName && (deliveryPersonName || deliveryPersonNumber)) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot provide delivery person details when courier company is provided"
                });
            }

            if (deliveryPersonName && (courierCompanyName || shipmentType)) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot provide courier details when delivery person is provided"
                });
            }

            const shipmentData = {
                bookedServiceId,
                courierCompanyName: courierCompanyName || null,
                trackingId: trackingId || null,
                pickUpDate,
                estimatedDeliveryDate,
                shipmentType: shipmentType || null,
                paymentMode,
                deliveryPersonName: deliveryPersonName || null,
                deliveryPersonNumber: deliveryPersonNumber || null,
                pickupLocation,
                deliveryAddress,
                image: req.file ? req.file.buffer : null,
                imageContentType: req.file ? req.file.mimetype : null,
            };

            const shipment = await ServiceShipmentDetails.create(shipmentData);

            await ServiceProcessDetail.create({
                bookedServiceId,
                stepName: "outForDelivery",
                stepDate: new Date(),
                stepStatus: "completed",
                statusNotes: "Shipment details added"
            });

            bookedService.currentStep = "process";
            await bookedService.save();

            await ServiceTrack.create({
                bookedServiceId,
                status: "Ready for delivery",
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Shipment details created successfully",
                data: shipment
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to create shipment details"
            });
        }
    },

    async markAsComplete(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(404).json({
                    success: false,
                    message: "bookedServiceId is required"
                });
            }

            const bookedService = await BookedService.findOne({ where: { bookedServiceId } });
            if (!bookedService) {
                return res.status(404).json({
                    success: false,
                    message: "Booked service not found"
                });
            }

            const step = ServiceProcessDetail.create({
                bookedServiceId,
                stepName: "completed",
                stepDate: new Date(),
                stepStatus: "completed",
                statusNotes: "All processes are completed"
            });

            bookedService.currentStep = "process";
            bookedService.status = "completed";
            await bookedService.save();

            await ServiceTrack.create({
                bookedServiceId,
                status: "Delivered",
                notes: "",
                createdAt: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "Service marked as completed"
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to mark as completed"
            })
        }
    },

    //get apis
    async getOrderReceived(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            const orderReceived = await ServiceProcessDetail.findOne({
                where: {
                    bookedServiceId,
                    stepName: "orderReceived",
                },
            });
            if (!orderReceived) {
                return res.status(404).json({
                    success: false,
                    message: "Order Received step not found for this bookedServiceId",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Order Received step retrieved successfully",
                data: orderReceived,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get details"
            })
        }
    },

    async getPartsReceived(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            const partsReceived = await ServiceProcessDetail.findOne({
                where: {
                    bookedServiceId,
                    stepName: "partReceived",
                },
            });
            if (!partsReceived) {
                return res.status(404).json({
                    success: false,
                    message: "Parts Received step not found for this bookedServiceId",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Part Received step retrieved successfully",
                data: partsReceived,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get details"
            })
        }
    },

    async getRepairProcess(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            const repairProcess = await ServiceProcessDetail.findOne({
                where: {
                    bookedServiceId,
                    stepName: "repairProcess",
                },
            });
            if (!repairProcess) {
                return res.status(404).json({
                    success: false,
                    message: "Repair process step not found for this bookedServiceId",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Repair process step retrieved successfully",
                data: repairProcess,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get details"
            })
        }
    },

    async getTestingProcess(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            const testingProcess = await ServiceProcessDetail.findOne({
                where: {
                    bookedServiceId,
                    stepName: "testing",
                },
            });
            if (!testingProcess) {
                return res.status(404).json({
                    success: false,
                    message: "Testing process step not found for this bookedServiceId",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Testing process step retrieved successfully",
                data: testingProcess,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get details"
            })
        }
    },

    async getInvoiceStepInfo(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            const invoiceStepInfo = await ServiceProcessDetail.findOne({
                where: {
                    bookedServiceId,
                    stepName: "invoice",
                },
            });
            if (!invoiceStepInfo) {
                return res.status(404).json({
                    success: false,
                    message: "Invoice step not found for this bookedServiceId",
                });
            }

            const invoice = await ServiceInvoice.findOne({
                where: { bookedServiceId },
                attributes: ["id", "invoiceNumber", "totalAmount", "invoiceDate"],
            });

            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    message: "No invoice found for this bookedServiceId",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Invoice step retrieved successfully",
                data: {
                    invoiceStepInfo,
                    invoice
                },
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get details"
            })
        }
    },

    async getShippingDetails(req, res) {
        try {
            const { bookedServiceId } = req.params;

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            const shipment = await ServiceShipmentDetails.findOne({
                where: { bookedServiceId },
                attributes: ["id", "courierCompanyName", "trackingId", "pickUpDate", "estimatedDeliveryDate", "shipmentType", "paymentMode", "deliveryPersonName", "deliveryPersonNumber", "pickupLocation", "deliveryAddress", "image", "imageContentType", "createdAt", "updatedAt"],
            });

            if (!shipment) {
                return res.status(404).json({
                    success: false,
                    message: "Shipping details not found for this bookedServiceId",
                });
            }

            const shipmentData = {
                ...shipment.toJSON(),
                image: shipment.image
                    ? `data:${shipment.imageContentType};base64,${shipment.image.toString("base64")}`
                    : null,
            };

            return res.status(200).json({
                success: true,
                message: "Shipping details fetched successfully",
                data: shipmentData,
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get shipping details",
            });
        }
    },

    async getCompletedStage(req, res) {
        try {
            const { bookedServiceId } = req.params

            if (!bookedServiceId) {
                return res.status(400).json({
                    success: false,
                    message: "bookedServiceId is required",
                });
            }

            const completed = await ServiceProcessDetail.findOne({
                where: {
                    bookedServiceId,
                    stepName: "completed",
                },
            });

            return res.status(200).json({
                success: true,
                message: "Details fetched successfully",
                data: completed
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get details"
            })
        }
    }

}

module.exports = ServiceProcessController;
