const express = require("express");
const BookedServiceController = require("../controllers/bookedServiceController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorize");
const { uploadFiles, upload } = require("../middlewares/upload");
const router = express.Router();

router.post(
    "/bookService",
    authMiddleware,
    authorize(["CUSTOMER"]),
    upload.any(),
    BookedServiceController.bookService
);

router.get(
    "/getBookedServiceForCustomers",
    authMiddleware,
    authorize(["CUSTOMER"]),
    BookedServiceController.getBookedServiceForCustomers
);

router.get(
    "/getBookedServices",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    BookedServiceController.getBookedServices
);

router.get(
    "/getBookedServiceDetails/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER", "CUSTOMER"]),
    BookedServiceController.getBookedServiceDetails
);

router.get(
    "/getBookedServicesItemImages/:bookedServiceItemId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    BookedServiceController.getBookedServiceItemImages
);

router.put(
    "/acceptRequest/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    BookedServiceController.acceptRequest
);

router.put(
    "/rejectRequest/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    BookedServiceController.rejectRequest
);

router.post(
    "/createEstimation/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    uploadFiles([{ name: "documents", maxCount: 5 }]),
    BookedServiceController.createEstimation
);

router.put(
    "/editEstimation/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    upload.any(),
    BookedServiceController.editEstimation
);

router.put(
    "/respondEstimation/:bookedServiceId",
    authMiddleware,
    authorize(["CUSTOMER"]),
    BookedServiceController.respondEstimation
);

router.get(
    "/getEstimation/:bookedServiceId",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER", "CUSTOMER"]),
    BookedServiceController.getEstimation
);

router.patch(
    "/assignPickup/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    BookedServiceController.assignPickup
);

//for customer
router.put(
    "/cancelRequest/:bookedServiceId",
    authMiddleware,
    authorize(["CUSTOMER"]),
    BookedServiceController.cancelRequest
);

//admin side
router.get(
    "/trackBookedService/:bookedServiceId",
    authMiddleware,
    authorize(["SERVICE_MANAGER"]),
    BookedServiceController.trackBookedService
);

//on hold
router.get(
    "/trackBookedServiceCustomer/:bookedServiceId",
    authMiddleware,
    authorize(["CUSTOMER"]),
    BookedServiceController.trackBookedServiceCustomer
);

module.exports = router;