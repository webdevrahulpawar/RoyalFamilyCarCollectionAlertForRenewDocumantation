const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const { env } = require("../startup");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getLocalPublicBaseUrl() {
  const port = env.PORT || 8080;
  const base = env.PUBLIC_URL || `http://localhost:${port}`;
  return base.replace(/\/$/, "");
}

async function uploadToCloudinary(file, { folder = "royal-cars" } = {}) {
  const { buffer, originalname, mimetype } = file;
  const ext = path.extname(originalname) || ".jpg";
  const publicId = `car-${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          public_id: publicId.replace(ext, ""),
          overwrite: true,
          transformation: [
            { width: 1600, crop: "limit" },
            { quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve({
            url: result.secure_url,
            publicId: result.public_id || "",
            alt: originalname,
            mimetype,
          });
        },
      )
      .end(buffer);
  });
}

async function uploadToLocal(file) {
  const uploadsDir = path.join(__dirname, "..", "..", "uploads");
  ensureDir(uploadsDir);

  const { buffer, originalname } = file;
  const ext = path.extname(originalname) || ".jpg";
  const safeName = `img-${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
  const fullPath = path.join(uploadsDir, safeName);
  fs.writeFileSync(fullPath, buffer);

  const url = `${getLocalPublicBaseUrl()}/uploads/${safeName}`;
  return { url, publicId: "", alt: originalname };
}

async function uploadImage(file, opts) {
  if (env.cloudinaryEnabled) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    return uploadToCloudinary(file, opts);
  }
  return uploadToLocal(file);
}

module.exports = { uploadImage };

