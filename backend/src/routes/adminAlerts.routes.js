const express = require("express");

const { alertsSummary, alertsList, runNow } = require("../controllers/adminAlerts.controller");

const router = express.Router();

router.get("/summary", alertsSummary);
router.get("/list", alertsList);
router.post("/run-now", runNow);

module.exports = router;

