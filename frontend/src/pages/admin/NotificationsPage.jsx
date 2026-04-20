import React, { useEffect, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import { api } from "../../api/client";
import { motion } from "framer-motion";
import { useToast } from "../../components/toast/ToastProvider";

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [channel, setChannel] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const r = await api.get("/admin/notifications", { params: { limit: 100, channel: channel || undefined } });
      setItems(r.data.notifications || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load notifications");
      toast?.push({ type: "error", title: "Load failed", message: "Could not fetch notification logs." }, 4500);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  return (
    <AdminShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-royal-gold/90">Notifications</div>
            <h2 className="mt-2 text-3xl font-bold royal-glow">Notification Logs</h2>
            <p className="mt-2 text-white/70">Email and dashboard reminder logs.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/80 outline-none focus:border-royal-gold/40"
            >
              <option value="">All channels</option>
              <option value="dashboard">Dashboard</option>
              <option value="email">Email</option>
            </select>
            <button
              onClick={load}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white/80 hover:border-royal-gold/40"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? <div className="mt-8 text-white/70">Loading notifications...</div> : null}
        {err ? <div className="mt-8 text-royal-danger">{err}</div> : null}

        {!loading && !err ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-royal-panel2 shadow-royal">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/25">
                <tr className="text-white/70">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Car</th>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Recipient</th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n._id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-white/70">
                      {n.alertDate || new Date(n.createdAt).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-white/80">{n.channel}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{n.car?.carName || ""}</div>
                      <div className="text-xs text-white/60">{n.car?.vehicleNumber || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{n.documentLabel || ""}</div>
                      <div className="text-xs text-white/60">
                        Expires {n.expiryDate ? new Date(n.expiryDate).toISOString().slice(0, 10) : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-royal-gold font-semibold">{n.daysRemaining}</td>
                    <td className="px-4 py-3">
                      <span className={n.status === "success" ? "text-royal-ok" : "text-royal-danger"}>
                        {n.status}
                      </span>
                      {n.error ? <div className="text-xs text-white/60 mt-1">{n.error}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-white/70">{n.recipient}</td>
                  </tr>
                ))}
                {!items.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-white/60">
                      No notification logs found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </motion.div>
    </AdminShell>
  );
}

