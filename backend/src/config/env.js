const { z } = require("zod");
require("dotenv").config();

function commaList(v) {
  if (!v) return [];
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(8080),
  MONGODB_URI: z.string().min(1),

  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("7d"),

  CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_SECRET: z.string().optional().or(z.literal("")),

  // ── Resend (replaces Nodemailer SMTP — works on all cloud platforms) ──
  RESEND_API_KEY: z.string().optional().or(z.literal("")),
  EMAIL_FROM: z.string().optional().or(z.literal("")),
  ADMIN_EMAILS: z.string().optional().or(z.literal("")),

  // Legacy SMTP fields kept for reference (no longer used)
  EMAIL_HOST: z.string().optional().or(z.literal("")),
  EMAIL_PORT: z.coerce.number().optional(),
  EMAIL_USER: z.string().optional().or(z.literal("")),
  EMAIL_PASS: z.string().optional().or(z.literal("")),

  CORS_ORIGINS: z.string().optional().or(z.literal("")),

  REMINDER_DAYS: z.coerce.number().default(30),
  CRON_SCHEDULE: z.string().default("0 0 * * *"),
  CRON_TZ: z.string().default("UTC"),
  RUN_CRON: z.coerce.boolean().default(true),

  ADMIN_USERNAME: z.string().optional().or(z.literal("")),
  ADMIN_PASSWORD: z.string().optional().or(z.literal("")),
});

const parsed = envSchema.parse(process.env);

module.exports = {
  ...parsed,
  ADMIN_EMAIL_LIST: commaList(parsed.ADMIN_EMAILS),
  corsOrigins: commaList(parsed.CORS_ORIGINS),
  // emailEnabled is now true when RESEND_API_KEY + EMAIL_FROM are set
  emailEnabled: Boolean(parsed.RESEND_API_KEY && parsed.EMAIL_FROM),
  cloudinaryEnabled: Boolean(
    parsed.CLOUDINARY_CLOUD_NAME && parsed.CLOUDINARY_API_KEY && parsed.CLOUDINARY_API_SECRET,
  ),
};
