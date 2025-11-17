const express = require("express");
const ServiceProcessController = require("../controllers/serviceProcessController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorize");
const { upload } = require("../middlewares/upload")
const router = express.Router();

router.post(
    "/receiveOrder/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    ServiceProcessController.receiveOrder
);

router.post(
    "/orderParts/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    ServiceProcessController.orderParts
);

router.get(
    "/getOrderedParts/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    ServiceProcessController.getOrderedParts
);

router.post(
    "/partsReceived/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    ServiceProcessController.partsReceived
);

router.put(
    "/repairProcess/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    ServiceProcessController.updateRepairProcess
);

router.put(
    "/testingProcess/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    ServiceProcessController.updateTestingProcess
);

router.post(
    "/createInvoice/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    ServiceProcessController.createInvoice
);

router.get(
    "/getAdditionalCharges/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER", "CUSTOMER"]),
    ServiceProcessController.getAdditionalCharges
);

router.post(
    "/createPayment/:serviceInvoiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    ServiceProcessController.createPayment
);

router.get(
    "/getPaymentHistory/:serviceInvoiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER", "CUSTOMER"]),
    ServiceProcessController.getPaymentHistory
);

router.get(
    "/getPaymentHistory/:serviceInvoiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER", "CUSTOMER"]),
    ServiceProcessController.getPaymentHistory
);

router.post(
    "/addShippingDetails/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    upload.single("image"),
    ServiceProcessController.addShippingDetails
);

router.post(
    "/markAsComplete/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    ServiceProcessController.markAsComplete
);

//get apis
router.get(
    "/getOrderReceived/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    ServiceProcessController.getOrderReceived
);

router.get(
    "/getPartsReceived/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    ServiceProcessController.getPartsReceived
);

router.get(
    "/getRepairProcess/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    ServiceProcessController.getRepairProcess
);

router.get(
    "/getTestingProcess/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    ServiceProcessController.getTestingProcess
);

router.get(
    "/getInvoiceStepInfo/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER", "CUSTOMER"]),
    ServiceProcessController.getInvoiceStepInfo
);

router.get(
    "/getShippingDetails/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    ServiceProcessController.getShippingDetails
);

router.get(
    "/getCompletedStage/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    ServiceProcessController.getCompletedStage
);

module.exports = router