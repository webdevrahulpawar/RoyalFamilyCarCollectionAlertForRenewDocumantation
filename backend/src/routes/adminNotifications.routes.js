const express = require("express");

const { listNotifications } = require("../controllers/adminNotifications.controller");

const router = express.Router();

router.get("/", listNotifications);

module.exports = router;

