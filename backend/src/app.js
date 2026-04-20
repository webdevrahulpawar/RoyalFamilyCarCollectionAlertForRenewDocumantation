const express = require("express");
require("express-async-errors");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const { env } = require("./startup");
const apiRoutes = require("./routes");

const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins && env.corsOrigins.length ? env.corsOrigins : true,
      credentials: true,
    }),
  );
  app.use(morgan("dev"));

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Serve local-uploaded images (Cloudinary uses remote URLs and doesn't need this).
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// small indirection so env is initialized once by server.js
module.exports = { createApp };

