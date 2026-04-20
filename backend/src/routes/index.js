const express = require("express");

const authRoutes = require("./auth.routes");
const carsPublicRoutes = require("./publicCars.routes");
const adminRoutes = require("./admin.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/cars", carsPublicRoutes);
router.use("/admin", adminRoutes);

module.exports = router;

