import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminShell from "../../components/admin/AdminShell";
import { api } from "../../api/client";
import { motion } from "framer-motion";
import { useToast } from "../../components/toast/ToastProvider";

function emptyOtherDoc() {
  return { label: "", number: "", expiryDate: "" };
}

export default function CarEditorPage({ mode }) {
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(isEdit);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    carName: "",
    vehicleNumber: "",
    ownerName: "",
    description: "",

    rcNumber: "",
    rcExpiryDate: "",

    insuranceNumber: "",
    insuranceExpiryDate: "",

    pucNumber: "",
    pucExpiryDate: "",

    driverName: "",
    driverLicenseNumber: "",
    driverLicenseExpiryDate: "",

    otherDocuments: [emptyOtherDoc()],
  });

  const [images, setImages] = useState([]); // new files to upload
  const [existingImages, setExistingImages] = useState([]); // loaded from backend for edit

  const canSubmit = useMemo(() => {
    return Boolean(form.carName && form.vehicleNumber && form.ownerName);
  }, [form.carName, form.vehicleNumber, form.ownerName]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isEdit) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr("");
      try {
        const r = await api.get(`/admin/cars/${id}`);
        if (cancelled) return;
        const { car, document } = r.data;
        setForm((f) => ({
          ...f,
          carName: car?.carName || "",
          vehicleNumber: car?.vehicleNumber || "",
          ownerName: car?.ownerName || "",
          description: car?.description || "",

          rcNumber: document?.rc?.number || "",
          rcExpiryDate: document?.rc?.expiryDate ? new Date(document.rc.expiryDate).toISOString().slice(0, 10) : "",

          insuranceNumber: document?.insurance?.number || "",
          insuranceExpiryDate: document?.insurance?.expiryDate
            ? new Date(document.insurance.expiryDate).toISOString().slice(0, 10)
            : "",

          pucNumber: document?.puc?.number || "",
          pucExpiryDate: document?.puc?.expiryDate ? new Date(document.puc.expiryDate).toISOString().slice(0, 10) : "",

          driverName: document?.driverLicense?.driverName || "",
          driverLicenseNumber: document?.driverLicense?.licenseNumber || "",
          driverLicenseExpiryDate: document?.driverLicense?.expiryDate
            ? new Date(document.driverLicense.expiryDate).toISOString().slice(0, 10)
            : "",

          otherDocuments:
            Array.isArray(document?.otherDocuments) && document.otherDocuments.length
              ? document.otherDocuments.map((d) => ({
                  label: d.label || "",
                  number: d.number || "",
                  expiryDate: d.expiryDate ? new Date(d.expiryDate).toISOString().slice(0, 10) : "",
                }))
              : [emptyOtherDoc()],
        }));
        setExistingImages(car?.images || []);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setErr(e?.response?.data?.error || "Failed to load car");
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isEdit, id]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function setOtherDoc(i, patch) {
    setForm((f) => {
      const next = [...f.otherDocuments];
      next[i] = { ...next[i], ...patch };
      return { ...f, otherDocuments: next };
    });
  }

  function addOtherDoc() {
    setForm((f) => ({ ...f, otherDocuments: [...f.otherDocuments, emptyOtherDoc()] }));
  }

  function removeOtherDoc(i) {
    setForm((f) => {
      const next = f.otherDocuments.filter((_, idx) => idx !== i);
      return { ...f, otherDocuments: next.length ? next : [emptyOtherDoc()] };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr("");

    const fd = new FormData();
    fd.append("carName", form.carName);
    fd.append("vehicleNumber", form.vehicleNumber);
    fd.append("ownerName", form.ownerName);
    fd.append("description", form.description || "");

    fd.append("rcNumber", form.rcNumber || "");
    fd.append("rcExpiryDate", form.rcExpiryDate || "");

    fd.append("insuranceNumber", form.insuranceNumber || "");
    fd.append("insuranceExpiryDate", form.insuranceExpiryDate || "");

    fd.append("pucNumber", form.pucNumber || "");
    fd.append("pucExpiryDate", form.pucExpiryDate || "");

    fd.append("driverName", form.driverName || "");
    fd.append("driverLicenseNumber", form.driverLicenseNumber || "");
    fd.append("driverLicenseExpiryDate", form.driverLicenseExpiryDate || "");

    const cleanedOther = form.otherDocuments
      .filter((d) => d.label && d.expiryDate)
      .map((d) => ({
        label: d.label,
        number: d.number || "",
        expiryDate: d.expiryDate,
      }));
    fd.append("otherDocuments", JSON.stringify(cleanedOther));

    // Append only selected new images
    for (const file of images) fd.append("images", file);

    try {
      if (isEdit) {
        await api.put(`/admin/cars/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast?.push({ type: "success", title: "Car updated", message: "Changes saved successfully." });
      } else {
        await api.post("/admin/cars", fd, { headers: { "Content-Type": "multipart/form-data" } });
        toast?.push({ type: "success", title: "Car added", message: "New record created." });
      }
      navigate("/admin/cars");
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Failed to save car");
      toast?.push({ type: "error", title: "Save failed", message: "Please check fields and try again." }, 4500);
    }
  }

  return (
    <AdminShell>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-royal-gold/90">
              {isEdit ? "Edit Car" : "Add Car"}
            </div>
            <h2 className="mt-2 text-3xl font-bold royal-glow">
              {isEdit ? "Update Royal Car Details" : "Create Royal Car Record"}
            </h2>
            <p className="mt-2 text-white/70">
              Store images and document expiry details for smart reminders.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/cars")}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white/80 hover:border-royal-gold/40"
          >
            Back
          </button>
        </div>

        {loading ? <div className="mt-6 text-white/70">Loading...</div> : null}
        {err ? <div className="mt-6 text-royal-danger">{err}</div> : null}

        {!loading ? (
          <form onSubmit={onSubmit} className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-royal-panel2 p-5 shadow-royal">
              <div className="font-semibold royal-glow">Car Gallery</div>
              <div className="mt-3 grid gap-3">
                <div>
                  <label className="block text-sm text-white/70">Car Name</label>
                  <input
                    value={form.carName}
                    onChange={(e) => setField("carName", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70">Vehicle Number</label>
                  <input
                    value={form.vehicleNumber}
                    onChange={(e) => setField("vehicleNumber", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                    placeholder="e.g. KA-01-XX-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70">Owner Name</label>
                  <input
                    value={form.ownerName}
                    onChange={(e) => setField("ownerName", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    className="mt-1 w-full min-h-[90px] rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70">Upload Images (max 4)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImages(Array.from(e.target.files || []))}
                    className="mt-1 w-full"
                  />
                  {existingImages.length && isEdit ? (
                    <div className="mt-3">
                      <div className="text-xs text-white/60">Existing images</div>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {existingImages.map((im) => (
                          <img
                            key={im.url}
                            src={im.url}
                            alt=""
                            loading="lazy"
                            className="h-16 w-20 rounded-lg object-cover border border-white/10"
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {images.length ? (
                    <div className="mt-3">
                      <div className="text-xs text-white/60">Selected images</div>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {images.map((f) => (
                          <img
                            key={f.name}
                            src={URL.createObjectURL(f)}
                            alt=""
                            className="h-16 w-20 rounded-lg object-cover border border-white/10"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-royal-panel2 p-5 shadow-royal">
              <div className="font-semibold royal-glow">Documents & Expiry</div>
              <div className="mt-4 grid gap-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="font-semibold text-royal-gold">RC</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-white/70">RC Number</label>
                      <input
                        value={form.rcNumber}
                        onChange={(e) => setField("rcNumber", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70">RC Expiry Date</label>
                      <input
                        type="date"
                        value={form.rcExpiryDate}
                        onChange={(e) => setField("rcExpiryDate", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="font-semibold text-royal-gold">Insurance</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-white/70">Insurance Number</label>
                      <input
                        value={form.insuranceNumber}
                        onChange={(e) => setField("insuranceNumber", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70">Insurance Expiry Date</label>
                      <input
                        type="date"
                        value={form.insuranceExpiryDate}
                        onChange={(e) => setField("insuranceExpiryDate", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="font-semibold text-royal-gold">PUC</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-white/70">PUC Number</label>
                      <input
                        value={form.pucNumber}
                        onChange={(e) => setField("pucNumber", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70">PUC Expiry Date</label>
                      <input
                        type="date"
                        value={form.pucExpiryDate}
                        onChange={(e) => setField("pucExpiryDate", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="font-semibold text-royal-gold">Driving License</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm text-white/70">Driver Name</label>
                      <input
                        value={form.driverName}
                        onChange={(e) => setField("driverName", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70">License Number</label>
                      <input
                        value={form.driverLicenseNumber}
                        onChange={(e) => setField("driverLicenseNumber", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-white/70">License Expiry Date</label>
                      <input
                        type="date"
                        value={form.driverLicenseExpiryDate}
                        onChange={(e) => setField("driverLicenseExpiryDate", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-royal-gold">Other Documents</div>
                    <button
                      type="button"
                      onClick={addOtherDoc}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/80 hover:border-royal-gold/40"
                    >
                      + Add Field
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {form.otherDocuments.map((d, i) => (
                      <div key={`${i}-${d.label}`} className="rounded-xl border border-white/10 bg-royal-panel2/50 p-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <label className="block text-xs text-white/70">Label</label>
                            <input
                              value={d.label}
                              onChange={(e) => setOtherDoc(i, { label: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-royal-gold/40"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/70">Number</label>
                            <input
                              value={d.number}
                              onChange={(e) => setOtherDoc(i, { number: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-royal-gold/40"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/70">Expiry Date</label>
                            <input
                              type="date"
                              value={d.expiryDate}
                              onChange={(e) => setOtherDoc(i, { expiryDate: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none focus:border-royal-gold/40"
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeOtherDoc(i)}
                            className="rounded-xl border border-royal-danger/30 bg-black/20 px-3 py-2 text-royal-danger hover:border-royal-danger/50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex items-center justify-between gap-3">
              <div className="text-sm text-white/60">
                Images are optional on update. Documents will trigger expiry reminders via daily cron.
              </div>
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-xl bg-gradient-to-r from-royal-gold to-royal-gold2 px-6 py-3 font-semibold text-black/90 hover:opacity-95 disabled:opacity-60"
              >
                {isEdit ? "Save Changes" : "Create Car Record"}
              </button>
            </div>
          </form>
        ) : null}
      </motion.div>
    </AdminShell>
  );
}

