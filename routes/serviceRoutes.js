const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorize");
const { uploadFiles } = require("../middlewares/upload")
const ServiceController = require("../controllers/serviceController");
const { serviceValidation, validate } = require("../middlewares/validators");
const router = express.Router();

router.post(
    "/createService",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    uploadFiles([{ name: "images", maxCount: 5 }]),
    serviceValidation,
    validate,
    ServiceController.createService
);

router.put(
    "/editService/:id",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    uploadFiles([{ name: "images", maxCount: 5 }]),
    ServiceController.editService
);

router.get(
    "/getServiceList",
    // authMiddleware,
    // authorize(["ADMIN", "SERVICE_MANAGER"]),
    ServiceController.getServiceList
);

router.get(
    "/getServiceDetails/:id",
    // authMiddleware,
    // authorize(["ADMIN", "SERVICE_MANAGER", "CUSTOMER"]),
    ServiceController.getServiceDetails
);

router.patch(
    "/blockService/:id",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    ServiceController.blockService
);

router.delete(
    "/deleteService/:id",
    authMiddleware,
    authorize(["ADMIN", "SERVICE_MANAGER"]),
    ServiceController.deleteService
);

module.exports = router;