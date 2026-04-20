const Document = require("../models/Document");
const Car = require("../models/Car");

const { startOfUTCToday, addDaysUTC, daysUntilUTC } = require("../utils/dateUtils");

function dateInRange(expiryDate, start, end) {
  if (!expiryDate) return false;
  const d = new Date(expiryDate);
  return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
}

function extractAlertsFromDocument(doc) {
  const car = doc.car || doc._doc?.car || null;
  const base = {
    carId: doc.carId,
    carName: car?.carName || "",
    vehicleNumber: car?.vehicleNumber || "",
    ownerName: car?.ownerName || "",
  };

  const alerts = [];

  if (doc.rc?.expiryDate && dateInRange(doc.rc.expiryDate, doc._rangeStart, doc._rangeEnd)) {
    alerts.push({
      ...base,
      documentType: "rc",
      documentLabel: "RC",
      documentNumber: doc.rc.number,
      expiryDate: doc.rc.expiryDate,
      daysRemaining: daysUntilUTC(doc.rc.expiryDate),
    });
  }

  if (
    doc.insurance?.expiryDate &&
    dateInRange(doc.insurance.expiryDate, doc._rangeStart, doc._rangeEnd)
  ) {
    alerts.push({
      ...base,
      documentType: "insurance",
      documentLabel: "Insurance",
      documentNumber: doc.insurance.number,
      expiryDate: doc.insurance.expiryDate,
      daysRemaining: daysUntilUTC(doc.insurance.expiryDate),
    });
  }

  if (doc.puc?.expiryDate && dateInRange(doc.puc.expiryDate, doc._rangeStart, doc._rangeEnd)) {
    alerts.push({
      ...base,
      documentType: "puc",
      documentLabel: "PUC",
      documentNumber: doc.puc.number,
      expiryDate: doc.puc.expiryDate,
      daysRemaining: daysUntilUTC(doc.puc.expiryDate),
    });
  }

  if (
    doc.driverLicense?.expiryDate &&
    dateInRange(doc.driverLicense.expiryDate, doc._rangeStart, doc._rangeEnd)
  ) {
    alerts.push({
      ...base,
      documentType: "driverLicense",
      documentLabel: "Driving License",
      documentNumber: doc.driverLicense.licenseNumber,
      expiryDate: doc.driverLicense.expiryDate,
      daysRemaining: daysUntilUTC(doc.driverLicense.expiryDate),
    });
  }

  if (Array.isArray(doc.otherDocuments) && doc.otherDocuments.length > 0) {
    for (const od of doc.otherDocuments) {
      if (od?.expiryDate && dateInRange(od.expiryDate, doc._rangeStart, doc._rangeEnd)) {
        alerts.push({
          ...base,
          documentType: "other",
          documentLabel: od.label,
          documentNumber: od.number,
          expiryDate: od.expiryDate,
          daysRemaining: daysUntilUTC(od.expiryDate),
        });
      }
    }
  }

  return alerts;
}

async function getExpiringAlerts({ daysAhead = 30 } = {}) {
  const start = startOfUTCToday(new Date());
  const end = addDaysUTC(start, daysAhead);
  console.log('[getExpiringAlerts] start:', start.toISOString(), 'end:', end.toISOString());

  const query = {
    $or: [
      { "rc.expiryDate": { $gte: start, $lte: end } },
      { "insurance.expiryDate": { $gte: start, $lte: end } },
      { "puc.expiryDate": { $gte: start, $lte: end } },
      { "driverLicense.expiryDate": { $gte: start, $lte: end } },
      { otherDocuments: { $elemMatch: { expiryDate: { $gte: start, $lte: end } } } },
    ],
  };

  const docs = await Document.find(query)
    .populate("carId", "carName vehicleNumber ownerName")
    .lean();
  console.log('[getExpiringAlerts] docs found:', docs.length);

  // Attach range info for extraction step
  const rangeStart = start;
  const rangeEnd = end;

  const alerts = [];
  for (const d of docs) {
    d._rangeStart = rangeStart;
    d._rangeEnd = rangeEnd;
    // When using populate with lean(), carId is still under carId; also add virtual.
    d.car = d.carId;
    alerts.push(...extractAlertsFromDocument(d));
  }
  console.log('[getExpiringAlerts] alerts extracted:', alerts.length);

  // Sort soonest first
  alerts.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  return alerts;
}

module.exports = { getExpiringAlerts };

