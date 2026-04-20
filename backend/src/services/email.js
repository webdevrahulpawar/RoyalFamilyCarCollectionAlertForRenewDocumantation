const nodemailer = require("nodemailer");

const { env } = require("../startup");

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465, // common SMTP choice
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates (for development)
    },
  });
  return cachedTransporter;
}

async function sendExpiryEmail({ to, subject, html }) {
  if (!env.emailEnabled) throw new Error("Email channel is not configured");
  const transporter = getTransporter();
  console.log('[sendExpiryEmail] sending to:', to);
  try {
    const result = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log('[sendExpiryEmail] sent successfully');
    return result;
  } catch (err) {
    console.error('[sendExpiryEmail] error:', err.message);
    throw err;
  }
}

module.exports = { sendExpiryEmail };

