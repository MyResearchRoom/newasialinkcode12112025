const express = require("express");
const categoryController = require("../controllers/categoryController");
const { validate, categoryValidation } = require("../middlewares/validators");
const authMiddleware = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/authorize");
const { upload } = require("../middlewares/upload");
const router = express.Router();

router.post(
    "/createCategory",
    authMiddleware,
    authorize(["ADMIN", "PRODUCT_MANAGER"]),
    upload.single("image"),
    categoryValidation,
    validate,
    categoryController.createCategory
);

router.get(
    "/getCategoryList",
    // authMiddleware,
    // authorize(["ADMIN", "PRODUCT_MANAGER"]),
    categoryController.getCategoryList
);

router.get(
    "/getCategoryDetails/:id",
    authMiddleware,
    authorize(["ADMIN", "PRODUCT_MANAGER"]),
    categoryController.getCategoryDetailsById
);

router.put(
    "/editCategory/:id",
    authMiddleware,
    authorize(["ADMIN", "PRODUCT_MANAGER"]),
    upload.single("image"),
    categoryController.editCategory
);

router.patch(
    "/blockCategory/:id",
    authMiddleware,
    authorize(["ADMIN"]),
    categoryController.blockCategory
);

router.delete(
    "/deleteCategory/:id",
    authMiddleware,
    authorize(["ADMIN", "PRODUCT_MANAGER"]),
    categoryController.deleteCategory
);

module.exports = router;
