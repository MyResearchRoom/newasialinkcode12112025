const { where, } = require("sequelize");
const { User, CustomerAddresses, Category, Product, ProductImage, ProductOrder, ProductOrderItem, ProductOrderStatusHistory, OrderShipmentDetails, CancelledProductOrder,ReturnedProductOrder,ProductReview, sequelize } = require("../models");
const generateOrderId = require("../utils/generateOrderId")

const ProductOrderController = {

    async placeOrder(req, res) {
        let transaction;
        try {
            transaction = await sequelize.transaction();
            const userId = req.user.id;
            const { addressId, paymentMethod, items } = req.body;

            if (!items || items.length === 0) {
                return res.status(400).json({ success: false, message: "Cart is empty" });
            }

            const orderId = await generateOrderId();

            let totalItems = 0;
            let subTotal = 0;
            let discountAmount = 0;
            let gstAmount = 0;
            let handlingCharges = 0;

            const orderItemsData = [];

            for (const item of items) {
                const product = await Product.findByPk(item.productId, { transaction });
                if (!product) {
                    await transaction.rollback();
                    return res.status(404).json({
                        success: false,
                        message: "Product not found"
                    });
                }

                if (product.totalStock < item.quantity) {
                    await transaction.rollback();
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for ${product.name}`
                    });
                }

                const originalPrice = parseFloat(product.originalPrice) || 0;
                const discountPercent = parseFloat(product.discountPercent) || 0;
                const gstPercent = parseFloat(product.gstPercent) || 0;
                const handling = parseFloat(product.handlingCharges) || 0;

                const itemSubTotal = originalPrice * item.quantity;
                const itemDiscount = (originalPrice * (discountPercent / 100)) * item.quantity;
                const itemGst = (originalPrice * (gstPercent / 100)) * item.quantity;
                const itemHandling = handling * item.quantity;

                const perItemDiscount = originalPrice * (discountPercent / 100);
                const itemPrice = originalPrice;
                const itemTotalPrice = (originalPrice - perItemDiscount) * item.quantity;

                totalItems += item.quantity;
                subTotal += itemSubTotal;
                discountAmount += itemDiscount;
                gstAmount += itemGst;
                handlingCharges += itemHandling;

                orderItemsData.push({
                    orderId,
                    productId: product.id,
                    quantity: item.quantity,
                    price: itemPrice,
                    discount: perItemDiscount,
                    totalPrice: itemTotalPrice,
                });

                await Product.update(
                    { totalStock: sequelize.literal(`totalStock - ${item.quantity}`) },
                    { where: { id: product.id }, transaction }
                );
            }

            const totalAmount = parseFloat(subTotal) - parseFloat(discountAmount) + parseFloat(gstAmount) + parseFloat(handlingCharges);

            const order = await ProductOrder.create(
                {
                    orderId,
                    userId,
                    addressId,
                    paymentMethod,
                    orderId,
                    totalItems,
                    subTotal,
                    discountAmount,
                    gstAmount,
                    handlingCharges,
                    totalAmount
                },
                { transaction }
            );

            await ProductOrderStatusHistory.create(
                {
                    orderId: order.orderId,
                    status: "newRequest",
                    changedAt: new Date(),
                },
                { transaction }
            );


            await ProductOrderItem.bulkCreate(orderItemsData, { transaction });

            const createdOrder = await ProductOrder.findOne({
                where: { orderId },
                include: [{ model: ProductOrderItem, as: "items" }],
                transaction
            });

            await transaction.commit();

            return res.status(201).json({
                success: true,
                message: "Order placed successfully",
                data: createdOrder
            });
        } catch (error) {
            if (transaction) await transaction.rollback();
            return res.status(500).json({
                success: false,
                message: "Failed to place order",
            });
        }
    },

    async getAllOrders(req, res) {
        try {

            const { page = 1, limit = 10, status } = req.query;
            const offset = (page - 1) * limit;
            let whereCondition = {};

            if (status) {
                whereCondition.status = status;
            }

            const { rows: orders, count: totalRecords } = await ProductOrder.findAndCountAll({
                where: whereCondition,
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "name"]
                    }
                ],
                order: [["createdAt", "DESC"]],
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
            });

            return res.status(200).json({
                success: true,
                message: "Orders fetched successfully",
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(totalRecords / limit),
                totalRecords,
                data: orders
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get orders"
            });
        }
    },

    // async getOrderDetailsById(req, res) {
    //     try {
    //         const { orderId } = req.params;

    //         if (!orderId) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: "Order Id is required"
    //             });
    //         }

    //         const order = await ProductOrder.findOne({
    //             where: { orderId },
    //             include: [
    //                 {
    //                     model: User,
    //                     as: "user",
    //                     attributes: ["id", "name", "email", "mobileNumber"]
    //                 },
    //                 {
    //                     model: CustomerAddresses,
    //                     as: "address",
    //                     attributes: [
    //                         "id", "flatNo", "buildingBlock", "floor", "buildingName",
    //                         "streetName", "landmark", "city", "state", "pincode"
    //                     ]
    //                 },
    //                 {
    //                     model: ProductOrderItem,
    //                     as: "items",
    //                     attributes: ["id", "quantity", "price", "discount", "productId"],
    //                     include: [
    //                         {
    //                             model: Product,
    //                             as: "product",
    //                             attributes: ["id", "productName", "model", "originalPrice",
    //                                 "discountedPrice", "description"
    //                             ],
    //                             include: [
    //                                 {
    //                                     model: ProductImage,
    //                                     as: "images",
    //                                     attributes: ["id", "image", "imageContentType"],
    //                                 },
    //                                 {
    //                                     model: Category,
    //                                     as: "category",
    //                                     attributes: ["id", "name"]
    //                                 }
    //                             ]
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     model: OrderShipmentDetails,
    //                     as: "shipment",
    //                     attributes: [
    //                         "trackingId", "estimatedDeliveryDate", "courierCompanyName",
    //                         "shipmentType", "pickupDate"
    //                     ]
    //                 }
    //             ]
    //         });

    //         if (!order) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: "Order not found"
    //             });
    //         }

    //         const orderData = order.toJSON();

    //         const userId = orderData.userId;
    //         const userReviews = await ProductReview.findAll({
    //             where: { userId }
    //         });

    //         const reviewedProductIds = new Set(userReviews.map(r => r.productId));

    //         const cancelledItems = await CancelledProductOrder.findAll({
    //             where: { orderId },
    //             attributes: ["orderItemId"]
    //         });

    //         const returnedItems = await ReturnedProductOrder.findAll({
    //             where: { orderId },
    //             attributes: ["orderItemId"]
    //         });

    //         const cancelledItemIds = cancelledItems.map(ci => Number(ci.orderItemId));
    //         const returnedItemIds = returnedItems.map(ri => Number(ri.orderItemId));

    //         orderData.items = await Promise.all(
    //             orderData.items.map(async (item) => {
    //                 const isCancelled = cancelledItemIds.includes(Number(item.id));
    //                 const isReturned = returnedItemIds.includes(Number(item.id));

    //                 if (item.product?.images) {
    //                     item.product.images = item.product.images.map(img =>
    //                         img.image
    //                             ? `data:${img.imageContentType};base64,${img.image.toString('base64')}`
    //                             : null
    //                     );
    //                 }

    //                 const alreadyReviewed = reviewedProductIds.has(item.productId);

    //                 const canReview = !alreadyReviewed;

    //                 return {
    //                     ...item,
    //                     isCancelled,
    //                     isReturned,
    //                     product: {
    //                         ...item.product,
    //                         canReview
    //                     }
    //                 };
    //             })
    //         );

    //         return res.status(200).json({
    //             success: true,
    //             message: "Order details fetched successfully",
    //             data: orderData
    //         });

    //     } catch (error) {
    //         console.log(error);
            
    //         return res.status(500).json({
    //             success: false,
    //             message: "Failed to fetch order details"
    //         });
    //     }
    // },

    //get particular customer's order
    async getCustomersOrders(req, res) {
        try {
            const userId = req.user.id
            const { status } = req.query;
            let whereCondition = { userId };

            if (status) {
                whereCondition.status = status;
            }

            const orders = await ProductOrder.findAll({
                where: whereCondition,
                include: [
                    {
                        model: ProductOrderItem,
                        as: "items",
                        include: [
                            {
                                model: Product,
                                as: "product",
                                attributes: ["id", "productName"],
                                include: [
                                    {
                                        model: ProductImage,
                                        as: "images",
                                        attributes: ["id", "image", "imageContentType"],
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [["createdAt", "DESC"]]
            });

            const formattedOrders = orders.map(order => {
                const orderData = order.toJSON();
                orderData.items = orderData.items.map(item => {
                    if (item.product && item.product.images) {
                        item.product.images = item.product.images.map(img => ({
                            id: img.id,
                            image: img.image
                                ? `data:${img.imageContentType};base64,${img.image.toString("base64")}`
                                : null
                        }));
                    }
                    return item;
                });
                return orderData;
            });


            return res.status(200).json({
                success: true,
                message: "Orders fetched successfully",
                data: formattedOrders
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get orders"
            });
        }
    },

    //old
    // async changeOrderStatus(req, res) {
    //     try {
    //         const { orderId } = req.params;

    //         if (!orderId) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: "Order Id is required"
    //             });
    //         }

    //         const order = await ProductOrder.findOne({
    //             where: { orderId }
    //         });

    //         if (!order) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: "Order not found"
    //             });
    //         }

    //         if (order.status === "delivered" || order.status === "cancelled") {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: `Cannot change status from ${order.status}`
    //             });
    //         }

    //         if (order.status === "newRequest") order.status = "processing";
    //         else if (order.status === "processing") order.status = "shipped";
    //         else if (order.status === "shipped") order.status = "outForDelivery";
    //         else if (order.status === "outForDelivery") order.status = "delivered";
    //         else return res.status(400).json({
    //             success: false,
    //             message: "Order cannot be updated"
    //         });

    //         await order.save();

    //         return res.status(200).json({
    //             success: true,
    //             message: `Order status updated to ${order.status}`
    //         });
    //     } catch (error) {
    //         return res.status(500).json({
    //             success: false,
    //             message: "Failed to change order status"
    //         });
    //     }
    // },

    //new api

    //new 
    async changeOrderStatus(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(404).json({
                    success: false,
                    message: "Order Id is required"
                });
            }

            const order = await ProductOrder.findOne({ where: { orderId } });
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            if (order.status === "delivered" || order.status === "cancelled") {
                return res.status(400).json({
                    success: false,
                    message: `Cannot change status from ${order.status}`
                });
            }

            let newStatus;

            if (order.status === "newRequest") {
                newStatus = "processing";
            } else if (order.status === "processing") {
                const shipment = await OrderShipmentDetails.findOne({ where: { orderId } });
                if (!shipment) {
                    return res.status(400).json({
                        success: false,
                        message: "Shipping details must be submitted before marking as shipped"
                    });
                }
                newStatus = "shipped";
            } else if (order.status === "shipped") {
                newStatus = "outForDelivery";
            } else if (order.status === "outForDelivery") {
                newStatus = "delivered";
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Order cannot be updated"
                });
            }

            order.status = newStatus;
            await order.save();

            await ProductOrderStatusHistory.create({
                orderId: order.orderId,
                status: newStatus,
                changedAt: new Date(),
            });

            return res.status(200).json({
                success: true,
                message: `Order status updated to ${newStatus}`
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to change order status"
            });
        }
    },

    async submitShippingDetails(req, res) {
        try {
            const { orderId } = req.params;
            const {
                courierCompanyName,
                trackingId,
                pickupDate,
                estimatedDeliveryDate,
                shipmentType,
                paymentMode,
                boxWeight,
                length,
                width,
                height,
                numberOfBoxes,
                pickupLocation,
            } = req.body;

            const order = await ProductOrder.findOne({ where: { orderId } });
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            if (order.status !== "processing") {
                return res.status(400).json({
                    success: false,
                    message: "Order is not in processing state",
                });
            }

            const existingShipment = await OrderShipmentDetails.findOne({ where: { orderId } });
            if (existingShipment) {
                return res.status(400).json({
                    success: false,
                    message: "Shipment details already submitted for this order",
                });
            }

            const shipment = await OrderShipmentDetails.create({
                orderId,
                courierCompanyName,
                trackingId,
                pickupDate,
                estimatedDeliveryDate,
                shipmentType,
                paymentMode: order.paymentMethod,
                boxWeight,
                length,
                width,
                height,
                numberOfBoxes,
                pickupLocation,
                deliveryAddress: order.addressId,
            });

            order.status = "shipped";
            await order.save();

            await ProductOrderStatusHistory.create({
                orderId: order.orderId,
                status: "shipped",
                changedAt: new Date(),
            });

            return res.status(200).json({
                success: true,
                message: "Shipping details submitted successfully, order status updated to shipped",
                data: shipment
            });

        } catch (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                message: "Failed to submit shipping details",
            });
        }
    },

    async getProductOrderStatusHistory(req, res) {
        try {
            const { orderId } = req.params;

            const order = await ProductOrder.findOne({ where: { orderId } });
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            const history = await ProductOrderStatusHistory.findAll({
                where: { orderId },
                order: [["changedAt", "ASC"]],
            });

            return res.status(200).json({
                success: true,
                message: "Order Status history fetched successfully.",
                orderId: order.orderId,
                currentStatus: order.status,
                history,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch order status history",
            });
        }
    },

    async cancelOrder(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(404).json({
                    success: false,
                    message: "Order Id is required"
                });
            }

            const order = await ProductOrder.findOne({
                where: { orderId }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            if (["shipped", "outForDelivery", "delivered", "cancelled"].includes(order.status)) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot cancel order with status ${order.status}`
                });
            }

            order.status = "cancelled";
            await order.save();

            const orderItems = await ProductOrderItem.findAll({ where: { orderId } });
            for (const item of orderItems) {
                await Product.increment(
                    { totalStock: item.quantity },
                    { where: { id: item.productId } }
                );
            }

            return res.status(200).json({
                success: true,
                message: "Order cancelled successfully",
                data: order
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to cancel order"
            });
        }
    },

    async getOrderDetailsById(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(404).json({
                    success: false,
                    message: "Order Id is required"
                });
            }

            const order = await ProductOrder.findOne({
                where: { orderId },
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "name", "email", "mobileNumber"]
                    },
                    {
                        model: CustomerAddresses,
                        as: "address",
                        attributes: [
                            "id", "flatNo", "buildingBlock", "floor", "buildingName",
                            "streetName", "landmark", "city", "state", "pincode"
                        ]
                    },
                    {
                        model: ProductOrderItem,
                        as: "items",
                        attributes: ["id", "quantity", "price", "discount", "productId"],
                        include: [
                            {
                                model: Product,
                                as: "product",
                                attributes: ["id", "productName", "model", "originalPrice",
                                    "discountedPrice", "description", "gstPrice", "handlingCharges"
                                ],
                                include: [
                                    {
                                        model: ProductImage,
                                        as: "images",
                                        attributes: ["id", "image", "imageContentType"],
                                    },
                                    {
                                        model: Category,
                                        as: "category",
                                        attributes: ["id", "name"]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: OrderShipmentDetails,
                        as: "shipment",
                        attributes: [
                            "trackingId", "estimatedDeliveryDate", "courierCompanyName",
                            "shipmentType", "pickupDate"
                        ]
                    }
                ]
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            const orderData = order.toJSON();

            const userId = orderData.userId;
            const userReviews = await ProductReview.findAll({
                where: { userId }
            });

            const reviewedProductIds = new Set(userReviews.map(r => r.productId));

            const cancelledItems = await CancelledProductOrder.findAll({
                where: { orderId },
                attributes: ["orderItemId"]
            });

            const returnedItems = await ReturnedProductOrder.findAll({
                where: { orderId },
                attributes: ["orderItemId"]
            });

            const cancelledItemIds = cancelledItems.map(ci => Number(ci.orderItemId));
            const returnedItemIds = returnedItems.map(ri => Number(ri.orderItemId));

            const activeItems = orderData.items.filter(item => !cancelledItemIds.includes(Number(item.id)));
            if (activeItems.length === 0 && order.status !== 'cancelled') {
                await ProductOrder.update(
                    { status: 'cancelled' },
                    { where: { orderId } }
                );
                orderData.status = 'cancelled';
            }


            orderData.items = activeItems.map(item => {
                const alreadyReviewed = reviewedProductIds.has(item.productId);

                if (item.product?.images) {
                    item.product.images = item.product.images.map(img =>
                        img.image
                            ? `data:${img.imageContentType};base64,${img.image.toString('base64')}`
                            : null
                    );
                }

                return {
                    ...item,
                    isCancelled: false,
                    isReturned: returnedItemIds.includes(Number(item.id)),
                    product: {
                        ...item.product,
                        canReview: !alreadyReviewed
                    }
                };
            });

            const subTotal = orderData.items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
            const discountAmount = orderData.items.reduce((sum, item) => sum + parseFloat(item.discount), 0);

            const gstAmount = orderData.items.reduce((sum, item) => {
                const productGST = parseFloat(item.product?.gstPrice || 0);
                return sum + productGST * item.quantity;
            }, 0);

            const handlingCharges = orderData.items.reduce((sum, item) => {
                const productHandling = parseFloat(item.product?.handlingCharges || 0);
                return sum + productHandling * item.quantity;
            }, 0);

            const totalAmount = subTotal - discountAmount + gstAmount + handlingCharges;

            orderData.subTotal = subTotal.toFixed(2);
            orderData.discountAmount = discountAmount.toFixed(2);
            orderData.gstAmount = gstAmount.toFixed(2);
            orderData.handlingCharges = handlingCharges.toFixed(2);
            orderData.totalAmount = totalAmount.toFixed(2);

            return res.status(200).json({
                success: true,
                message: "Order details fetched successfully",
                data: orderData
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch order details"
            });
        }
    },

};

module.exports = ProductOrderController;
