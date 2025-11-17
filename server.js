const express = require("express");
const { Sequelize } = require("sequelize");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const countRoutes = require("./routes/countRoutes");
const productStockRoutes = require("./routes/productStockRoutes");
const customerAddressRoutes = require("./routes/customerAddressRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cartRoutes");
const productOrderRoutes = require("./routes/productOrderRoutes");
const productReviewRoutes = require("./routes/productReviewRoutes");
const bookedServiceRoutes = require("./routes/bookedServiceRoutes");
const cancelledProductOrderRoutes = require("./routes/cancelledProductOrderRoutes");
const returnedProductOrderRoutes = require("./routes/returnedProductOrderRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const serviceProcessRoutes = require("./routes/serviceProcessRoutes");

const db = require("./models");

const allowedOrigins = process.env.CLIENT_URL.split(",");

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    })
);

app.get("/test", (req, res) => {
    res.send("<h1>API is working ✅</h1>");
});

app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/count", countRoutes);
app.use("/api/stock", productStockRoutes);
app.use("/api/address", customerAddressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/productOrder", productOrderRoutes);
app.use("/api/productReview", productReviewRoutes);
app.use("/api/bookedService", bookedServiceRoutes);
app.use("/api/cancelProductOrder", cancelledProductOrderRoutes);
app.use("/api/returnProductOrder", returnedProductOrderRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/serviceProcess", serviceProcessRoutes);


db.sequelize
    .authenticate()
    .then(() => console.log("Database connected"))
    .catch((err) => console.error("Unable to connect to Database:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
