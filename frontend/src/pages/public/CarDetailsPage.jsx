import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/client";
import { ImageSlider } from "../../components/gallery/ImageSlider";
import { motion } from "framer-motion";

export default function CarDetailsPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/cars/${id}`)
      .then((r) => {
        if (cancelled) return;
        setCar(r.data.car || null);
        setDocument(r.data.document || null);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(e?.response?.data?.error || "Failed to load");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {loading ? <div className="text-white/70">Loading...</div> : null}
        {err ? <div className="text-royal-danger">{err}</div> : null}
        {!loading && car ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <ImageSlider images={car.images || []} />
            <div className="rounded-2xl border border-white/10 bg-royal-panel2 p-6 shadow-royal">
              <div className="text-xs uppercase tracking-widest text-royal-gold/90">Vehicle</div>
              <h1 className="mt-2 text-3xl font-bold royal-glow">{car.carName}</h1>
              <div className="mt-2 text-white/80">
                <div>
                  <span className="text-white/60">Vehicle Number:</span> {car.vehicleNumber}
                </div>
                <div className="mt-1">
                  <span className="text-white/60">Owner:</span> {car.ownerName}
                </div>
              </div>
              <p className="mt-4 text-white/75 leading-relaxed">{car.description}</p>

              <div className="mt-6">
                <div className="text-xs uppercase tracking-widest text-royal-gold/90">Documents</div>
                {document ? (
                  <div className="mt-3 space-y-3 text-sm">
                    {[
                      {
                        label: "RC",
                        number: document.rc?.number,
                        expiryDate: document.rc?.expiryDate,
                      },
                      {
                        label: "Insurance",
                        number: document.insurance?.number,
                        expiryDate: document.insurance?.expiryDate,
                      },
                      {
                        label: "PUC",
                        number: document.puc?.number,
                        expiryDate: document.puc?.expiryDate,
                      },
                      {
                        label: "Driving License",
                        number: document.driverLicense?.licenseNumber,
                        expiryDate: document.driverLicense?.expiryDate,
                      },
                    ].map((d) => {
                      if (!d.expiryDate && !d.number) return null;
                      const dt = d.expiryDate ? new Date(d.expiryDate) : null;
                      const iso = dt ? dt.toISOString().slice(0, 10) : "";
                      return (
                        <div key={d.label} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold">{d.label}</div>
                              {d.number ? <div className="text-xs text-white/65 mt-1">{d.number}</div> : null}
                            </div>
                            {dt ? (
                              <div className="text-right">
                                <div className="text-xs text-white/60">Expiry</div>
                                <div className="text-sm text-white">{iso}</div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}

                    {Array.isArray(document.otherDocuments) && document.otherDocuments.length ? (
                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                        <div className="font-semibold">Other Documents</div>
                        <div className="mt-2 space-y-2">
                          {document.otherDocuments.map((od, idx) => {
                            const dt = od.expiryDate ? new Date(od.expiryDate) : null;
                            const iso = dt ? dt.toISOString().slice(0, 10) : "";
                            return (
                              <div key={`${od.label}-${idx}`} className="flex items-center justify-between gap-3 text-sm">
                                <div>
                                  <div className="text-white/80">{od.label}</div>
                                  {od.number ? <div className="text-xs text-white/60">{od.number}</div> : null}
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-white/60">Expiry</div>
                                  <div className="text-sm text-white">{iso}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-white/60">No document info found.</div>
                )}
              </div>

              <div className="mt-5 text-sm text-white/60">
                Images are optimized and loaded lazily for better performance.
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

