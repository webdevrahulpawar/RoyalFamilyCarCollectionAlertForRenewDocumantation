function startOfUTCToday(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function addDaysUTC(d, days) {
  const res = new Date(d);
  res.setUTCDate(res.getUTCDate() + days);
  return res;
}

function toYYYYMMDDUTC(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysUntilUTC(expiryDate) {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const now = startOfUTCToday(new Date());
  const start = startOfUTCToday(now);
  const diffMs = expiry.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

module.exports = { startOfUTCToday, addDaysUTC, toYYYYMMDDUTC, daysUntilUTC };

