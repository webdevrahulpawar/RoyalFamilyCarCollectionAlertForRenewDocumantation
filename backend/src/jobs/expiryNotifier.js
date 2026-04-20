const cron = require("node-cron");

const Notification = require("../models/Notification");
const { env } = require("../startup");
const { getExpiringAlerts } = require("../services/expiryService");
const { toYYYYMMDDUTC } = require("../utils/dateUtils");
const { sendExpiryEmail } = require("../services/email");

function formatHumanDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

function buildEmailHtml({ carName, vehicleNumber, ownerName, docLabel, expiryDate, daysRemaining }) {
  const expiry = formatHumanDate(expiryDate);
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin:0 0 10px;">Royal Car Collection Reminder</h2>
      <p style="margin:0 0 10px;">A document is expiring soon:</p>
      <ul style="margin:0; padding-left: 18px;">
        <li><b>Car:</b> ${carName || ""} (${vehicleNumber || ""})</li>
        <li><b>Owner:</b> ${ownerName || ""}</li>
        <li><b>Document:</b> ${docLabel}</li>
        <li><b>Expiry Date:</b> ${expiry}</li>
        <li><b>Days Remaining:</b> ${daysRemaining}</li>
      </ul>
      <p style="margin-top:14px;">Please renew the document to avoid issues.</p>
    </div>
  `;
}

function buildBaseMessage({ carName, vehicleNumber, ownerName, docLabel, expiryDate, daysRemaining }) {
  const expiry = formatHumanDate(expiryDate);
  return `Royal Car Collection Reminder:
Car: ${carName || ""} (${vehicleNumber || ""})
Owner: ${ownerName || ""}
Document: ${docLabel}
Expiry Date: ${expiry}
Days Remaining: ${daysRemaining}`;
}

async function sendForAlert(alert, { todayAlertDate }) {
  const {
    carId,
    carName,
    vehicleNumber,
    ownerName,
    documentLabel,
    documentType,
    documentNumber,
    expiryDate,
    daysRemaining,
  } = alert;

  const alertMessage = buildBaseMessage({
    carName,
    vehicleNumber,
    ownerName,
    docLabel: documentLabel,
    expiryDate,
    daysRemaining,
  });

  const results = [];

  // Always log dashboard alert
  results.push(
    Notification.create({
      type: "expiry_reminder",
      channel: "dashboard",
      recipient: "dashboard",
      message: alertMessage,
      carId,
      documentType,
      documentLabel,
      daysRemaining,
      expiryDate,
      alertDate: todayAlertDate,
      status: "success",
    }).catch((e) => {
      // duplicate unique index => ignore
      if (e?.code === 11000) return null;
      throw e;
    }),
  );

  const emailRecipients = env.ADMIN_EMAIL_LIST || [];

  if (env.emailEnabled && emailRecipients.length) {
    for (const to of emailRecipients) {
      const html = buildEmailHtml({
        carName,
        vehicleNumber,
        ownerName,
        docLabel: documentLabel,
        expiryDate,
        daysRemaining,
      });
      results.push(
        sendExpiryEmail({
          to,
          subject: `Royal Reminder: ${documentLabel} expiring soon`,
          html,
        })
          .then(() =>
            Notification.create({
              type: "expiry_reminder",
              channel: "email",
              recipient: to,
              message: alertMessage,
              carId,
              documentType,
              documentLabel,
              daysRemaining,
              expiryDate,
              alertDate: todayAlertDate,
              status: "success",
            }),
          )
          .catch((err) =>
            Notification.create({
              type: "expiry_reminder",
              channel: "email",
              recipient: to,
              message: alertMessage,
              carId,
              documentType,
              documentLabel,
              daysRemaining,
              expiryDate,
              alertDate: todayAlertDate,
              status: "failed",
              error: String(err?.message || err),
            }).catch((e) => {
              // If duplicate dashboard/email log already exists, ignore.
              if (e?.code === 11000) return null;
              throw e;
            }),
          ),
      );
    }
  }

  await Promise.all(results);
}

async function runOnce() {
  console.log('[expiryNotifier] running once');
  const todayAlertDate = toYYYYMMDDUTC(new Date());
  const alerts = await getExpiringAlerts({ daysAhead: env.REMINDER_DAYS });
  console.log('[expiryNotifier] alerts found:', alerts.length);

  if (!alerts.length) return { sent: 0 };

  // Send sequentially to reduce provider burst issues.
  for (const alert of alerts) {
    // eslint-disable-next-line no-await-in-loop
    await sendForAlert(alert, { todayAlertDate });
  }
  return { sent: alerts.length };
}

function startExpiryNotifier() {
  console.log('[expiryNotifier] starting, RUN_CRON:', env.RUN_CRON);
  // Cron schedule (runs in production); still usable in dev if RUN_CRON=true.
  cron.schedule(
    env.CRON_SCHEDULE,
    () => runOnce().catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[expiryNotifier] failed", e);
    }),
    { timezone: env.CRON_TZ },
  );

  if (env.RUN_CRON) {
    console.log('[expiryNotifier] running initial runOnce');
    // Kick once on boot to surface alerts quickly.
    runOnce().catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[expiryNotifier] initial run failed", e);
    });
  }
}

module.exports = { startExpiryNotifier, runOnce };

