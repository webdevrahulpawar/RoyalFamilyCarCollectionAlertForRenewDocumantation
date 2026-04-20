import React, { useEffect, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import { api } from "../../api/client";
import { motion } from "framer-motion";
import { useToast } from "../../components/toast/ToastProvider";
import { Link } from "react-router-dom";

export default function CarsPage() {
  const toast = useToast();

  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [expiringSoon, setExpiringSoon] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 10;

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const r = await api.get("/admin/cars", {
        params: { q, ownerName, expiringSoon, page, limit },
      });
      setCars(r.data.cars || []);
      setTotal(r.data.total || 0);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load cars");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    // reset to first page when filters change
    setPage(1);
  }, [q, ownerName, expiringSoon]);

  async function onExport() {
    try {
      const r = await api.get("/admin/cars/export", {
        params: { q, ownerName, expiringSoon },
        responseType: "blob",
      });
      const blob = new Blob([r.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "royal-cars.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast?.push({ type: "success", title: "Export started", message: "Excel file downloaded." });
    } catch (e) {
      toast?.push({ type: "error", title: "Export failed", message: "Try again." }, 4500);
    }
  }

  async function onDelete(id) {
    if (!window.confirm("Delete this car? This will also remove its document records.")) return;
    try {
      await api.delete(`/admin/cars/${id}`);
      toast?.push({ type: "success", title: "Car deleted", message: "Record removed successfully." });
      load();
    } catch (e) {
      toast?.push({
        type: "error",
        title: "Delete failed",
        message: e?.response?.data?.error || "Please try again.",
      });
    }
  }

  return (
    <AdminShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-royal-gold/90">Cars</div>
            <h2 className="mt-2 text-3xl font-bold royal-glow">Manage Car Collection</h2>
            <p className="mt-2 text-white/70">Search, filter, edit, delete and export to Excel.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onExport}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white/80 hover:border-royal-gold/40"
            >
              Export Excel
            </button>
            <Link
              to="/admin/cars/new"
              className="rounded-xl bg-gradient-to-r from-royal-gold to-royal-gold2 px-4 py-2 font-semibold text-black/90 hover:opacity-95"
            >
              + Add Car
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-royal-panel2 p-4 shadow-royal">
          <div className="grid gap-3 lg:grid-cols-4">
            <div>
              <label className="block text-sm text-white/70">Search</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                placeholder="Car, vehicle number, owner..."
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">Owner</label>
              <input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                placeholder="Owner name..."
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={expiringSoon}
                  onChange={(e) => setExpiringSoon(e.target.checked)}
                />
                Expiring within {30} days
              </label>
            </div>
            <div className="flex items-center justify-end lg:col-span-1">
              <button
                onClick={load}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white/80 hover:border-royal-gold/40"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {err ? <div className="mt-4 text-royal-danger">{err}</div> : null}
        {loading ? <div className="mt-6 text-white/70">Loading cars...</div> : null}

        {!loading ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-royal-panel2 shadow-royal">
            <table className="w-full text-left">
              <thead className="bg-black/25">
                <tr className="text-sm text-white/70">
                  <th className="px-4 py-3">Car</th>
                  <th className="px-4 py-3">Vehicle #</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Images</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((c) => (
                  <tr key={c._id} className="border-t border-white/10 text-sm">
                    <td className="px-4 py-3 font-semibold">
                      {c.carName}
                      <div className="text-xs text-white/60 font-normal mt-1">{c.description}</div>
                    </td>
                    <td className="px-4 py-3 text-white/80">{c.vehicleNumber}</td>
                    <td className="px-4 py-3 text-white/80">{c.ownerName}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {(c.images || []).slice(0, 3).map((im) => (
                          <img
                            key={im.url}
                            src={im.url}
                            alt=""
                            loading="lazy"
                            className="h-10 w-14 rounded-lg border border-white/10 object-cover"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/cars/${c._id}/edit`}
                          className="rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-white/80 hover:border-royal-gold/40"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => onDelete(c._id)}
                          className="rounded-xl border border-royal-danger/30 bg-black/20 px-3 py-1.5 text-royal-danger hover:border-royal-danger/50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!cars.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-white/60">
                      No cars found for the current filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}

        {!loading && total ? (
          <div className="mt-5 flex items-center justify-between text-sm text-white/70">
            <div>
              Showing {(page - 1) * limit + 1}-{Math.min(total, page * limit)} of {total}
            </div>
            <div className="flex gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </motion.div>
    </AdminShell>
  );
}

