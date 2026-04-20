import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { CarCard } from "../../components/gallery/CarCard";
import { motion } from "framer-motion";

export default function GalleryPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/cars")
      .then((r) => {
        if (cancelled) return;
        setCars(r.data.cars || []);
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
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-royal-gold/90">Royal</div>
            <h1 className="text-4xl font-bold royal-glow">Car Collection Gallery</h1>
            <p className="mt-2 text-white/70">
              Explore the gallery with royal details and history.
            </p>
          </div>
          <Link
            to="/admin/login"
            className="inline-block rounded bg-royal-gold/20 px-6 py-2.5 text-sm font-semibold text-royal-gold transition-all hover:bg-royal-gold hover:text-royal-dark"
          >
            Admin Login
          </Link>
        </header>

        {loading ? <div className="text-white/70">Loading cars...</div> : null}
        {err ? <div className="text-royal-danger">{err}</div> : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

