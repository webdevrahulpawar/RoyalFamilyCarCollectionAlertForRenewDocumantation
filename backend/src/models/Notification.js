const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, default: "expiry_reminder", index: true }, // future: other types
    channel: { type: String, enum: ["email", "dashboard"], index: true },

    recipient: { type: String, default: "" },
    message: { type: String, default: "" },

    carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", index: true },

    documentType: { type: String, default: "" }, // rc/insurance/puc/driverLicense/other
    documentLabel: { type: String, default: "" }, // e.g. "RC"
    daysRemaining: { type: Number, index: true },
    expiryDate: { type: Date, index: true },

    alertDate: { type: String, required: true, index: true }, // YYYY-MM-DD
    status: { type: String, enum: ["success", "failed"], default: "success" },
    error: { type: String, default: "" },
  },
  { timestamps: true },
);

// Prevent duplicate sends per recipient/channel/day/document.
notificationSchema.index(
  { channel: 1, recipient: 1, carId: 1, documentType: 1, alertDate: 1 },
  { unique: true },
);

module.exports = mongoose.model("Notification", notificationSchema);

