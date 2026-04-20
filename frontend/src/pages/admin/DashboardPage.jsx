import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import AdminShell from "../../components/admin/AdminShell";
import { motion } from "framer-motion";
import { Modal } from "../../components/common/Modal";
import { useToast } from "../../components/toast/ToastProvider";

export default function DashboardPage() {
  const toast = useToast();

  const [totalCars, setTotalCars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [err, setErr] = useState("");

  const days = 30;

  const alertCount = useMemo(() => alerts.length, [alerts]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const [carsRes, alertsRes] = await Promise.all([
          api.get("/admin/cars", { params: { limit: 1, page: 1 } }),
          api.get("/admin/alerts/summary", { params: { days, limit: 10 } }),
        ]);
        if (cancelled) return;
        setTotalCars(carsRes.data.total || 0);
        setAlerts(alertsRes.data.alerts || []);
        if ((alertsRes.data.alerts || []).length > 0) {
          setModalOpen(true);
          toast?.push({
            type: "info",
            title: "Expiry reminders available",
            message: "Some documents are expiring soon. Review alerts.",
          }, 5000);
        }
      } catch (e) {
        if (cancelled) return;
        setErr(e?.response?.data?.error || "Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [toast, days]);

  return (
    <AdminShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-royal-gold/90">Overview</div>
            <h2 className="mt-2 text-3xl font-bold royal-glow">Admin Dashboard</h2>
            <p className="mt-2 text-white/70">Total cars and documents expiring within {days} days.</p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-2xl border border-white/10 bg-royal-panel2 p-4 shadow-royal w-44">
              <div className="text-sm text-white/60">Total Cars</div>
              <div className="mt-2 text-3xl font-bold text-royal-gold">{totalCars}</div>
            </div>
            <div className="rounded-2xl border border-royal-gold/25 bg-black/20 p-4 shadow-royal w-44">
              <div className="text-sm text-white/60">Expiring Alerts</div>
              <div className="mt-2 text-3xl font-bold text-royal-gold">{alertCount}</div>
            </div>
          </div>
        </div>

        {err ? <div className="mt-6 text-royal-danger">{err}</div> : null}
        {loading ? <div className="mt-6 text-white/70">Loading dashboard...</div> : null}

        {!loading && !err ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-royal-panel2 p-5 shadow-royal">
              <div className="flex items-center justify-between">
                <div className="font-semibold royal-glow">Expiring Documents</div>
                <div className="text-xs text-white/60">Top {Math.min(10, alerts.length)}</div>
              </div>

              {alerts.length ? (
                <div className="mt-4 space-y-3">
                  {alerts.map((a, idx) => (
                    <div
                      key={`${a.carId}-${a.documentType}-${idx}`}
                      className="rounded-xl border border-white/10 bg-black/20 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{a.carName}</div>
                          <div className="text-sm text-white/65">{a.vehicleNumber} • {a.ownerName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/60">{a.documentLabel}</div>
                          <div className="text-royal-gold font-semibold">{a.daysRemaining} days</div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-white/70">
                        Expires on <span className="text-white">{new Date(a.expiryDate).toISOString().slice(0, 10)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-white/70">No documents expiring within the next {days} days.</div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-royal-panel2 p-5 shadow-royal">
              <div className="font-semibold royal-glow">Quick Actions</div>
              <div className="mt-3 text-white/70 text-sm">
                Manage your cars, update documents, and review notification logs.
              </div>
              <div className="mt-5 space-y-3">
                <a href="/admin/cars" className="block rounded-xl border border-white/10 bg-black/20 px-4 py-3 hover:border-royal-gold/40">
                  Manage Cars
                </a>
                <a href="/admin/notifications" className="block rounded-xl border border-white/10 bg-black/20 px-4 py-3 hover:border-royal-gold/40">
                  View Notification Logs
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>

      <Modal
        open={modalOpen}
        title="Expiry Alerts"
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 hover:border-white/20"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        }
      >
        {alerts.length ? (
          <div className="space-y-3">
            {alerts.map((a, idx) => (
              <div key={`${a.carId}-${a.documentType}-${idx}`} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="font-semibold">{a.carName}</div>
                <div className="text-sm text-white/70">{a.vehicleNumber} • {a.ownerName}</div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-sm text-white/70">
                    {a.documentLabel} expires on{" "}
                    <span className="text-white">{new Date(a.expiryDate).toISOString().slice(0, 10)}</span>
                  </div>
                  <div className="text-royal-gold font-semibold">{a.daysRemaining} days</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-white/70">No expiring documents found.</div>
        )}
      </Modal>
    </AdminShell>
  );
}

