const { Op, Sequelize } = require("sequelize");
const { User, Category, Product, Service, ProductOrder, CancelledProductOrder, ReturnedProductOrder, BookedService, ServiceProcessDetail } = require("../models");

const CountController = {

    async getCounts(req, res) {
        try {

            //general counts
            const totalCustomers = await User.count({ where: { role: "CUSTOMER" } })
            const totalStaffs = await User.count({
                where: { role: { [Op.in]: ["PRODUCT_MANAGER", "SERVICE_MANAGER"] } }
            });
            const totalCategories = await Category.count();

            //products count
            const totalProducts = await Product.count();
            const totalBestSellerProducts = await Product.count({
                where: Sequelize.literal(`JSON_CONTAINS(displaySections, '"Bestseller"')`)
            });
            const totalNewArrivalProducts = await Product.count({
                where: Sequelize.literal(`JSON_CONTAINS(displaySections, '"New Arrival"')`)
            });
            const totalOffersDiscountsProducts = await Product.count({
                where: Sequelize.literal(`JSON_CONTAINS(displaySections, '"Offers & Discount"')`)
            });
            const totalNewRequests = await ProductOrder.count({ where: { status: "newRequest" } });
            const totalProcessing = await ProductOrder.count({ where: { status: "processing" } });
            const totalShipped = await ProductOrder.count({ where: { status: "shipped" } });
            const totalOutForDelivery = await ProductOrder.count({ where: { status: "outForDelivery" } });
            const totalDelivered = await ProductOrder.count({ where: { status: "delivered" } });
            const totalCancelled = await CancelledProductOrder.count();
            const totalReturned = await ReturnedProductOrder.count();

            //services count
            const totalServices = await Service.count();
            const totalGeneralServices = await Service.count({
                where: Sequelize.literal(`JSON_CONTAINS(displaySections, '"General"')`)
            });
            const totalPopularServices = await Service.count({
                where: Sequelize.literal(`JSON_CONTAINS(displaySections, '"popular"')`)
            });
            const totalOffersDiscountsServices= await Service.count({
                where: Sequelize.literal(`JSON_CONTAINS(displaySections, '"Offers & Discount"')`)
            });
            const totalNewServiceRequests = await BookedService.count({ where: { status: "pending" } });
            const totalInPickup = await BookedService.count({ where: { currentStep: "pickup" } });
            const totalInRepair = await ServiceProcessDetail.count({ where: { stepName: "repairProcess", stepStatus: "pending" } });
            const totalOutForDeliveryRequest = await ServiceProcessDetail.count({ where: { stepName: "outForDelivery", stepStatus: "pending" } });
            const totalCompleted = await ServiceProcessDetail.count({ where: { stepName: "completed", stepStatus: "completed" } });

            return res.status(200).json({
                success: true,
                message: "Counts fetched successfully.",
                data: {
                    totalCustomers,
                    totalStaffs,
                    totalCategories,
                    totalProducts,
                    totalBestSellerProducts,
                    totalNewArrivalProducts,
                    totalOffersDiscountsProducts,
                    totalNewRequests,
                    totalProcessing,
                    totalShipped,
                    totalOutForDelivery,
                    totalDelivered,
                    totalCancelled,
                    totalReturned,
                    totalServices,
                    totalPopularServices,
                    totalOffersDiscountsServices,
                    totalGeneralServices,
                    totalNewServiceRequests,
                    totalInPickup,
                    totalInRepair,
                    totalOutForDeliveryRequest,
                    totalCompleted
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to get counts",
            });
        }
    },

}

module.exports = CountController