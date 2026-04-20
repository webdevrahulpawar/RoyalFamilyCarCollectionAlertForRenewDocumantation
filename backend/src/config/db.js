const mongoose = require("mongoose");

async function connectDB({ uri }) {
  if (!uri) throw new Error("MONGODB_URI is required");

  mongoose.set("strictQuery", false);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
  });
}

module.exports = { connectDB };

