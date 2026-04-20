const express = require("express");
const { uploadImages } = require("../middleware/uploadImages");

const {
  listCarsAdmin,
  createCarAdmin,
  getCarAdmin,
  updateCarAdmin,
  deleteCarAdmin,
  exportCarsExcel,
} = require("../controllers/adminCars.controller");

const router = express.Router();

router.get("/", listCarsAdmin);
router.post("/", uploadImages, createCarAdmin);
router.get("/export", exportCarsExcel);

router.get("/:id", getCarAdmin);
router.put("/:id", uploadImages, updateCarAdmin);
router.delete("/:id", deleteCarAdmin);

module.exports = router;

