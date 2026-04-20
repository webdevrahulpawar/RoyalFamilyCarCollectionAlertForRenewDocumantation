const express = require("express");

const { listCars, getCar } = require("../controllers/publicCars.controller");

const router = express.Router();

router.get("/", listCars);
router.get("/:id", getCar);

module.exports = router;

