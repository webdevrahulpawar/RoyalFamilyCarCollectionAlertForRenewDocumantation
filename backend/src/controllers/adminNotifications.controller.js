const Notification = require("../models/Notification");

async function listNotifications(req, res) {
  const { channel, limit = "50", page = "1" } = req.query;
  const limitNum = Math.min(200, Math.max(1, Number(limit) || 50));
  const pageNum = Math.max(1, Number(page) || 1);

  const filter = {};
  if (channel) filter.channel = String(channel);

  const total = await Notification.countDocuments(filter);
  const items = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate("carId", "carName vehicleNumber ownerName")
    .lean();

  const mapped = items.map((n) => ({
    ...n,
    car: n.carId || null,
  }));

  return res.json({ total, notifications: mapped });
}

module.exports = { listNotifications };

