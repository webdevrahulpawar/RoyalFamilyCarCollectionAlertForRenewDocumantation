const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    alt: { type: String, default: "" },
  },
  { _id: false },
);

const carSchema = new mongoose.Schema(
  {
    carName: { type: String, required: true, trim: true, index: true },
    vehicleNumber: { type: String, required: true, trim: true, unique: true, index: true },
    ownerName: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    images: { type: [imageSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Car", carSchema);

