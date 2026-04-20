const mongoose = require("mongoose");
const Car = require("../models/Car");
const Document = require("../models/Document");
const Notification = require("../models/Notification");
const { env } = require("../startup");

const { uploadImage } = require("../services/cloudinary");
const { exportCarsToExcel } = require("../services/excel");
const { startOfUTCToday, addDaysUTC } = require("../utils/dateUtils");

function parseNullableDate(v) {
  if (!v) return null;
  const d = new Date(v);
  // Invalid date => null
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function parseOtherDocuments(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function buildCarsTextSearchQuery(q) {
  if (!q) return {};
  const rx = new RegExp(String(q).trim(), "i");
  return {
    $or: [
      { carName: rx },
      { vehicleNumber: rx },
      { ownerName: rx },
      { description: rx },
    ],
  };
}

async function getCarDocsByCarIds(carIds) {
  if (!carIds.length) return new Map();
  const docs = await Document.find({ carId: { $in: carIds } }).lean();
  const map = new Map();
  for (const d of docs) map.set(String(d.carId), d);
  return map;
}

function parseExpirySoonCarIds({ daysAhead = 30 } = {}) {
  const start = startOfUTCToday(new Date());
  const end = addDaysUTC(start, daysAhead);

  const query = {
    $or: [
      { "rc.expiryDate": { $gte: start, $lte: end } },
      { "insurance.expiryDate": { $gte: start, $lte: end } },
      { "puc.expiryDate": { $gte: start, $lte: end } },
      { "driverLicense.expiryDate": { $gte: start, $lte: end } },
      { otherDocuments: { $elemMatch: { expiryDate: { $gte: start, $lte: end } } } },
    ],
  };
  return { start, end, query };
}

async function listCarsAdmin(req, res) {
  const { q, ownerName, expiringSoon, page = "1", limit = "20" } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const textQuery = buildCarsTextSearchQuery(q);
  if (ownerName) textQuery.ownerName = new RegExp(String(ownerName).trim(), "i");

  let carIdsFilter = null;
  if (String(expiringSoon).toLowerCase() === "true") {
    const { query } = parseExpirySoonCarIds({ daysAhead: env.REMINDER_DAYS });
    const docs = await Document.find(query).select("carId").lean();
    carIdsFilter = docs.map((d) => d.carId);
    if (!carIdsFilter.length) return res.json({ total: 0, cars: [] });
  }

  const filter = carIdsFilter
    ? { ...textQuery, _id: { $in: carIdsFilter } }
    : { ...textQuery };

  const total = await Car.countDocuments(filter);
  const cars = await Car.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .select("carName vehicleNumber ownerName description images")
    .lean();

  const carIds = cars.map((c) => c._id);
  const docsMap = await getCarDocsByCarIds(carIds);

  const enriched = cars.map((c) => ({
    ...c,
    document: docsMap.get(String(c._id)) || null,
  }));

  return res.json({ total, cars: enriched });
}

async function createCarAdmin(req, res) {
  const {
    carName,
    vehicleNumber,
    ownerName,
    description,

    // RC
    rcNumber,
    rcExpiryDate,
    // Insurance
    insuranceNumber,
    insuranceExpiryDate,
    // PUC
    pucNumber,
    pucExpiryDate,
    // Driver license
    driverName,
    driverLicenseNumber,
    driverLicenseExpiryDate,

    // Other
    otherDocuments,
  } = req.body;

  if (!carName || !vehicleNumber || !ownerName) {
    return res.status(400).json({ error: "carName, vehicleNumber and ownerName are required" });
  }

  const files = req.files || [];
  const images = [];

  // Upload/optimize images (Cloudinary preferred).
  for (const f of files) {
    // eslint-disable-next-line no-await-in-loop
    const uploaded = await uploadImage(f, { folder: "royal-car-collection/cars" });
    images.push({ url: uploaded.url, publicId: uploaded.publicId || "", alt: uploaded.alt || "" });
  }

  const car = await Car.create({
    carName,
    vehicleNumber,
    ownerName,
    description: description || "",
    images,
  });

  await Document.create({
    carId: car._id,
    rc: { number: rcNumber || "", expiryDate: parseNullableDate(rcExpiryDate) },
    insurance: { number: insuranceNumber || "", expiryDate: parseNullableDate(insuranceExpiryDate) },
    puc: { number: pucNumber || "", expiryDate: parseNullableDate(pucExpiryDate) },
    driverLicense: {
      driverName: driverName || "",
      licenseNumber: driverLicenseNumber || "",
      expiryDate: parseNullableDate(driverLicenseExpiryDate),
    },
    otherDocuments: parseOtherDocuments(otherDocuments)
      .filter((d) => d?.label && d?.expiryDate)
      .map((d) => ({
        label: String(d.label),
        number: String(d.number || ""),
        expiryDate: parseNullableDate(d.expiryDate),
      }))
      .filter((d) => d.expiryDate),
  });

  return res.status(201).json({ carId: car._id });
}

async function getCarAdmin(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  const car = await Car.findById(id)
    .select("carName vehicleNumber ownerName description images")
    .lean();
  if (!car) return res.status(404).json({ error: "Car not found" });

  const document = await Document.findOne({ carId: id }).lean();
  return res.json({ car, document });
}

async function updateCarAdmin(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  const {
    carName,
    vehicleNumber,
    ownerName,
    description,

    rcNumber,
    rcExpiryDate,
    insuranceNumber,
    insuranceExpiryDate,
    pucNumber,
    pucExpiryDate,
    driverName,
    driverLicenseNumber,
    driverLicenseExpiryDate,
    otherDocuments,
  } = req.body;

  if (!carName || !vehicleNumber || !ownerName) {
    return res.status(400).json({ error: "carName, vehicleNumber and ownerName are required" });
  }

  const files = req.files || [];
  let images = null;
  if (files.length) {
    images = [];
    for (const f of files) {
      // eslint-disable-next-line no-await-in-loop
      const uploaded = await uploadImage(f, { folder: "royal-car-collection/cars" });
      images.push({ url: uploaded.url, publicId: uploaded.publicId || "", alt: uploaded.alt || "" });
    }
  }

  const car = await Car.findByIdAndUpdate(
    id,
    {
      carName,
      vehicleNumber,
      ownerName,
      description: description || "",
      ...(images ? { images } : {}),
    },
    { new: true },
  );
  if (!car) return res.status(404).json({ error: "Car not found" });

  const updatedDoc = {
    rc: { number: rcNumber || "", expiryDate: parseNullableDate(rcExpiryDate) },
    insurance: { number: insuranceNumber || "", expiryDate: parseNullableDate(insuranceExpiryDate) },
    puc: { number: pucNumber || "", expiryDate: parseNullableDate(pucExpiryDate) },
    driverLicense: {
      driverName: driverName || "",
      licenseNumber: driverLicenseNumber || "",
      expiryDate: parseNullableDate(driverLicenseExpiryDate),
    },
    otherDocuments: parseOtherDocuments(otherDocuments)
      .filter((d) => d?.label && d?.expiryDate)
      .map((d) => ({
        label: String(d.label),
        number: String(d.number || ""),
        expiryDate: parseNullableDate(d.expiryDate),
      }))
      .filter((d) => d.expiryDate),
  };

  await Document.updateOne({ carId: id }, updatedDoc, { upsert: true, setDefaultsOnInsert: true });

  return res.json({ ok: true });
}

async function deleteCarAdmin(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

  const car = await Car.findByIdAndDelete(id);
  if (!car) return res.status(404).json({ error: "Car not found" });

  await Document.deleteOne({ carId: id });
  await Notification.deleteMany({ carId: id });

  return res.json({ ok: true });
}

async function exportCarsExcel(req, res) {
  const { q, ownerName, expiringSoon } = req.query;

  const textQuery = buildCarsTextSearchQuery(q);
  if (ownerName) textQuery.ownerName = new RegExp(String(ownerName).trim(), "i");

  let carIdsFilter = null;
  if (String(expiringSoon).toLowerCase() === "true") {
    const { query } = parseExpirySoonCarIds({ daysAhead: env.REMINDER_DAYS });
    const docs = await Document.find(query).select("carId").lean();
    carIdsFilter = docs.map((d) => d.carId);
    if (!carIdsFilter.length) {
      return res.status(404).json({ error: "No cars found to export" });
    }
  }

  const filter = carIdsFilter ? { ...textQuery, _id: { $in: carIdsFilter } } : { ...textQuery };

  const cars = await Car.find(filter).sort({ createdAt: -1 }).lean();
  const carIds = cars.map((c) => c._id);
  const docs = await Document.find({ carId: { $in: carIds } }).lean();
  const docMap = new Map();
  for (const d of docs) docMap.set(String(d.carId), d);

  const merged = cars.map((c) => ({ ...c, document: docMap.get(String(c._id)) || null }));

  const buffer = exportCarsToExcel({ cars: merged });
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="royal-cars.xlsx"`);
  return res.send(buffer);
}

module.exports = {
  listCarsAdmin,
  createCarAdmin,
  getCarAdmin,
  updateCarAdmin,
  deleteCarAdmin,
  exportCarsExcel,
};

