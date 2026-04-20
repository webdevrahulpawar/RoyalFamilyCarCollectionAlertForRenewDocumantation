const mongoose = require("mongoose");

const otherDocumentSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    number: { type: String, default: "" },
    expiryDate: { type: Date, required: true },
  },
  { _id: false },
);

const documentSchema = new mongoose.Schema(
  {
    carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true, unique: true, index: true },

    rc: {
      number: { type: String, default: "" },
      expiryDate: { type: Date, default: null },
    },
    insurance: {
      number: { type: String, default: "" },
      expiryDate: { type: Date, default: null },
    },
    puc: {
      number: { type: String, default: "" },
      expiryDate: { type: Date, default: null },
    },
    driverLicense: {
      driverName: { type: String, default: "" },
      licenseNumber: { type: String, default: "" },
      expiryDate: { type: Date, default: null },
    },

    otherDocuments: { type: [otherDocumentSchema], default: [] },
  },
  { timestamps: true },
);

// Indexes for reminder queries
documentSchema.index({ "rc.expiryDate": 1 });
documentSchema.index({ "insurance.expiryDate": 1 });
documentSchema.index({ "puc.expiryDate": 1 });
documentSchema.index({ "driverLicense.expiryDate": 1 });
documentSchema.index({ "otherDocuments.expiryDate": 1 });

module.exports = mongoose.model("Document", documentSchema);

