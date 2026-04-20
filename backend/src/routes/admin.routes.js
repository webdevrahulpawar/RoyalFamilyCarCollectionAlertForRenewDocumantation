const express = require("express");
const { requireAdmin } = require("../middleware/authMiddleware");

const adminCarsRoutes = require("./adminCars.routes");
const adminNotificationsRoutes = require("./adminNotifications.routes");
const adminAlertsRoutes = require("./adminAlerts.routes");

const router = express.Router();

router.use(requireAdmin);

router.use("/cars", adminCarsRoutes);
router.use("/notifications", adminNotificationsRoutes);
router.use("/alerts", adminAlertsRoutes);

module.exports = router;

