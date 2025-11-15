const { check, validationResult } = require("express-validator")

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
};

const userValidation = [
    check("name")
        .notEmpty()
        .withMessage("Name is required")
        .trim()
        .escape(),

    check("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),

    check("mobileNumber")
        .notEmpty()
        .withMessage("Mobile number is required.")
        .isNumeric()
        .withMessage("Mobile number must contain only numbers.")
        .isLength({ min: 10, max: 10 })
        .withMessage("Mobile number must be 10 digits.")
        .trim(),

    check("gender")
        .notEmpty()
        .withMessage("Gender is required.")
        .isIn(["male", "female", "other"])
        .withMessage("Gender must be 'male', 'female', or 'other'"),

    check("address")
        .optional({ checkFalsy: true })
        .trim()
        .escape(),

    check("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["ADMIN", "PRODUCT_MANAGER", "SERVICE_MANAGER", "DELIVERY_ASSOCIATE", "CUSTOMER"])
        .withMessage("Role must be one of 'ADMIN', 'PRODUCT_MANAGER', 'SERVICE_MANAGER', 'DELIVERY_ASSOCIATE,' ,'CUSTOMER'"),

    check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/\d/)
        .withMessage("Password must contain at least one number")
        .matches(/[\W_]/)
        .withMessage("Password must contain at least one special character"),
];

const categoryValidation = [
    check("name")
        .notEmpty()
        .withMessage("Category name is required")
        .trim()
        .escape(),

    check("image")
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error("At least one image is required");
            }

            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
            if (!allowedTypes.includes(req.file.mimetype)) {
                throw new Error("Invalid image format. Only JPEG, JPG, PNG allowed.");
            }

            const maxSize = 2 * 1024 * 1024;
            if (req.file.size > maxSize) {
                throw new Error("Image size should not exceed 2MB");
            }

            return true;
        }),
];

const productValidation = [
    check("productName")
        .notEmpty()
        .withMessage("Product name is required")
        .trim()
        .escape(),

    check("model")
        .notEmpty()
        .withMessage("Model is required")
        .trim()
        .escape(),

    check("categoryId")
        .notEmpty()
        .withMessage("Category ID is required")
        .isInt()
        .withMessage("Category ID must be a number"),

    check("originalPrice")
        .notEmpty()
        .withMessage("Original price is required")
        .isFloat({ gt: 0 })
        .withMessage("Original price must be greater than 0"),

    check("discountPercent")
        .notEmpty()
        .withMessage("Discount percent is required")
        .isFloat({ min: 0, max: 100 })
        .withMessage("Discount percent must be between 0 and 100"),

    check("images")
        .custom((value, { req }) => {
            if (!req.files || !req.files.images || req.files.images.length === 0) {
                throw new Error("At least one product image is required");
            }

            if (req.files.images.length > 5) {
                throw new Error("You can upload a maximum of 5 images only");
            }

            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
            req.files.images.forEach(file => {
                if (!allowedTypes.includes(file.mimetype)) {
                    throw new Error("Invalid image format. Only JPEG, JPG, PNG allowed.");
                }

                const maxSize = 2 * 1024 * 1024;
                if (file.size > maxSize) {
                    throw new Error("Image size should not exceed 2MB");
                }
            });

            return true;
        }),
];

const serviceValidation = [
    check("serviceName")
        .notEmpty()
        .withMessage("Service name is required")
        .trim()
        .escape(),

    check("price")
        .notEmpty()
        .withMessage("Price is required")
        .isFloat({ gt: 0 })
        .withMessage("Price must be greater than 0"),

    check("description")
        .notEmpty()
        .withMessage("Description is required")
        .trim(),

    check("images")
        .custom((value, { req }) => {
            if (!req.files || !req.files.images || req.files.images.length === 0) {
                throw new Error("At least one service image is required");
            }

            if (req.files.images.length > 5) {
                throw new Error("You can upload a maximum of 5 images only");
            }

            const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
            req.files.images.forEach(file => {
                if (!allowedTypes.includes(file.mimetype)) {
                    throw new Error("Invalid image format. Only JPEG, JPG, PNG allowed.");
                }

                const maxSize = 2 * 1024 * 1024;
                if (file.size > maxSize) {
                    throw new Error("Image size should not exceed 2MB");
                }
            });

            return true;
        }),
];

const customerAddressValidation = [
    check("flatNo")
        .notEmpty()
        .withMessage("Flat number is required")
        .trim()
        .escape(),

    check("buildingName")
        .notEmpty()
        .withMessage("Building name is required")
        .trim()
        .escape(),

    check("city")
        .notEmpty()
        .withMessage("City is required")
        .trim()
        .escape(),

    check("state")
        .notEmpty()
        .withMessage("State is required")
        .trim()
        .escape(),

    check("pincode")
        .notEmpty()
        .withMessage("Pincode is required")
        .isNumeric()
        .withMessage("Pincode must be numeric")
        .isLength({ min: 6, max: 6 })
        .withMessage("Pincode length must be 6")
];

const enquiryValidation = [
    check("name")
        .notEmpty()
        .withMessage("Name is required")
        .trim()
        .escape(),

    check("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),

    check("mobileNumber")
        .notEmpty()
        .withMessage("Mobile number is required.")
        .isNumeric()
        .withMessage("Mobile number must contain only numbers.")
        .isLength({ min: 10, max: 10 })
        .withMessage("Mobile number must be 10 digits.")
        .trim(),

    check("message")
        .notEmpty()
        .withMessage("Message is required.")
        .isLength({ min: 10 })
        .withMessage("Message must be at least 10 characters long.")
        .trim()
];

const shipmentValidation = [
    check("courierCompanyName")
        .notEmpty()
        .withMessage("Courier company name is required")
        .trim()
        .escape(),

    check("trackingId")
        .notEmpty()
        .withMessage("Tracking ID is required")
        .trim()
        .escape(),

    check("pickupDate")
        .notEmpty()
        .withMessage("Pickup date is required")
        .isISO8601()
        .withMessage("Pickup date must be a valid date"),

    check("estimatedDeliveryDate")
        .notEmpty()
        .withMessage("Estimated delivery date is required")
        .isISO8601()
        .withMessage("Estimated delivery date must be a valid date"),

    check("shipmentType")
        .notEmpty()
        .withMessage("Shipment type is required")
        .isIn(["standard", "express", "oneDay"])
        .withMessage("Shipment type must be 'standard', 'express' or 'oneDay'"),

    // check("paymentMode")
    //     .notEmpty()
    //     .withMessage("Payment mode is required")
    //     .trim()
    //     .escape(),

    check("boxWeight")
        .notEmpty()
        .withMessage("Box weight is required")
        .isFloat({ gt: 0 })
        .withMessage("Box weight must be a positive number"),

    check("length")
        .notEmpty()
        .withMessage("Length is required")
        .isFloat({ gt: 0 })
        .withMessage("Length must be a positive number"),

    check("width")
        .notEmpty()
        .withMessage("Width is required")
        .isFloat({ gt: 0 })
        .withMessage("Width must be a positive number"),

    check("height")
        .notEmpty()
        .withMessage("Height is required")
        .isFloat({ gt: 0 })
        .withMessage("Height must be a positive number"),

    check("numberOfBoxes")
        .notEmpty()
        .withMessage("Number of boxes is required")
        .isInt({ gt: 0 })
        .withMessage("Number of boxes must be a positive integer"),

    check("pickupLocation")
        .notEmpty()
        .withMessage("Pickup location is required")
        .trim()
        .escape(),

    // check("deliveryAddress")
    //     .notEmpty()
    //     .withMessage("Delivery address is required")
    //     .trim()
    //     .escape(),
];

module.exports = {
    validate,
    userValidation,
    categoryValidation,
    productValidation,
    serviceValidation,
    customerAddressValidation,
    enquiryValidation,
    shipmentValidation
};