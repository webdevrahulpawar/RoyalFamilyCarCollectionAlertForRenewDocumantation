const mongoose = require("mongoose");
const Car = require("../models/Car");
const Document = require("../models/Document");

async function listCars(req, res) {
  const cars = await Car.find({})
    .select("carName vehicleNumber ownerName description images")
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ cars });
}

async function getCar(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  const car = await Car.findById(id)
    .select("carName vehicleNumber ownerName description images")
    .lean();
  if (!car) return res.status(404).json({ error: "Car not found" });

  const document = await Document.findOne({ carId: id }).lean();
  return res.json({ car, document });
}

module.exports = { listCars, getCar };

