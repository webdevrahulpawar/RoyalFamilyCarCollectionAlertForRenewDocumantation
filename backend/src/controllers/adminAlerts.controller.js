const { getExpiringAlerts } = require("../services/expiryService");
const { runOnce } = require("../jobs/expiryNotifier");

async function alertsSummary(req, res) {
  const days = req.query.days ? Number(req.query.days) : 30;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const alerts = await getExpiringAlerts({ daysAhead: days });
  const limited = alerts.slice(0, Math.max(1, limit || 10));

  return res.json({
    days,
    total: alerts.length,
    alerts: limited,
  });
}

async function alertsList(req, res) {
  const days = req.query.days ? Number(req.query.days) : 30;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const page = req.query.page ? Number(req.query.page) : 1;

  const alerts = await getExpiringAlerts({ daysAhead: days });
  const total = alerts.length;
  const pageNum = Math.max(1, page || 1);
  const limitNum = Math.min(200, Math.max(1, limit || 50));

  const slice = alerts.slice((pageNum - 1) * limitNum, (pageNum - 1) * limitNum + limitNum);
  return res.json({ days, total, alerts: slice });
}

async function runNow(req, res) {
  const result = await runOnce();
  return res.json(result);
}

module.exports = { alertsSummary, alertsList, runNow };

