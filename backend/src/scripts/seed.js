const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { env } = require("../startup");
const { connectDB } = require("../config/db");

const User = require("../models/User");
const Car = require("../models/Car");
const Document = require("../models/Document");

const placeholderImages = (seed) => [
  { url: `https://picsum.photos/seed/${seed}-1/900/600`, publicId: "", alt: "Royal car" },
  { url: `https://picsum.photos/seed/${seed}-2/900/600`, publicId: "", alt: "Royal car" },
  { url: `https://picsum.photos/seed/${seed}-3/900/600`, publicId: "", alt: "Royal car" },
  { url: `https://picsum.photos/seed/${seed}-4/900/600`, publicId: "", alt: "Royal car" },
];

function toISODateOnly(d) {
  return new Date(d).toISOString().slice(0, 10);
}

async function seedAdmin() {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    // eslint-disable-next-line no-console
    console.log("[seed] ADMIN_USERNAME/ADMIN_PASSWORD not set, skipping admin creation.");
    return;
  }

  const exists = await User.findOne({ username: env.ADMIN_USERNAME });
  if (exists) return;

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await User.create({ username: env.ADMIN_USERNAME, passwordHash, role: "admin" });
  // eslint-disable-next-line no-console
  console.log("[seed] Admin user created.");
}

async function seedCars() {
  // Create a few cars with expiring docs within 30 days.
  const now = new Date();
  const addDays = (n) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() + n);
    return d;
  };

  const cars = [
    {
      carName: "Royal Sedan Aurora",
      vehicleNumber: "KA-01-ROY-1001",
      ownerName: "Royal Family Trust",
      description: "Historic sedan restored with royal craftsmanship.",
      images: placeholderImages("royal-sedan-aurora"),
    },
    {
      carName: "Maharaja Coupe Splendor",
      vehicleNumber: "MH-12-ROY-2002",
      ownerName: "Maharaja Estate",
      description: "A curated collection coupe with classic lineage.",
      images: placeholderImages("maharaja-coupe-splendor"),
    },
    {
      carName: "Nizam Grand Tourer",
      vehicleNumber: "TG-09-ROY-3003",
      ownerName: "Nizam Heritage",
      description: "Long-distance grand tourer used for ceremonial drives.",
      images: placeholderImages("nizam-grand-tourer"),
    },
  ];

  for (const c of cars) {
    const exists = await Car.findOne({ vehicleNumber: c.vehicleNumber });
    const car = exists || (await Car.create(c));

    const docs = await Document.findOne({ carId: car._id });
    if (docs) continue;

    await Document.create({
      carId: car._id,
      rc: { number: `RC-${car.vehicleNumber}-A`, expiryDate: addDays(10) },
      insurance: { number: `INS-${car.vehicleNumber}-B`, expiryDate: addDays(25) },
      puc: { number: `PUC-${car.vehicleNumber}-C`, expiryDate: addDays(40) }, // not within 30
      driverLicense: {
        driverName: "Admin Driver",
        licenseNumber: `DL-${car.vehicleNumber}-D`,
        expiryDate: addDays(5),
      },
      otherDocuments: [
        { label: "Permit", number: `PER-${car.vehicleNumber}`, expiryDate: addDays(30) },
        { label: "Fitness", number: `FIT-${car.vehicleNumber}`, expiryDate: addDays(60) },
      ],
    });
  }
}

async function main() {
  await connectDB({ uri: env.MONGODB_URI });
  await seedAdmin();
  await seedCars();
  // eslint-disable-next-line no-console
  console.log("[seed] Completed.");
  await mongoose.disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("[seed] Failed:", e);
  process.exit(1);
});

