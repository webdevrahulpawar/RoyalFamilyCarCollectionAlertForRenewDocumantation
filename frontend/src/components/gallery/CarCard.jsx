import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function CarCard({ car }) {
  const safeImages = useMemo(() => (car?.images || []).filter(Boolean), [car?.images]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // Auto-rotate lightly for a “slider feel” on the gallery card.
    if (safeImages.length <= 1) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % safeImages.length), 3500);
    return () => window.clearInterval(t);
  }, [safeImages.length]);

  const current = safeImages[idx] || safeImages[0] || null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group rounded-2xl border border-white/10 bg-royal-panel2 shadow-royal overflow-hidden"
    >
      <Link to={`/cars/${car._id || car.id}`}>
        <div className="relative aspect-[4/3] bg-black/20">
          {current ? (
            <img
              src={current.url}
              alt={current.alt || car.carName || "Car image"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white/50">No image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent opacity-95" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="font-semibold royal-glow">{car.carName}</div>
            <div className="text-sm text-white/75">{car.vehicleNumber}</div>
          </div>
          <div className="absolute top-3 right-3 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/80">
            {car.ownerName}
          </div>

          {safeImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx((i) => (i - 1 + safeImages.length) % safeImages.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 px-3 py-1 text-white"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx((i) => (i + 1) % safeImages.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 px-3 py-1 text-white"
                aria-label="Next image"
              >
                ›
              </button>
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                {safeImages.slice(0, 4).map((im, i) => {
                  const active = i === idx;
                  return (
                    <button
                      key={im.url}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIdx(i);
                      }}
                      className={`h-2 flex-1 rounded-full transition ${active ? "bg-royal-gold" : "bg-white/25 hover:bg-white/35"}`}
                      aria-label={`Select image ${i + 1}`}
                    />
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
        <div className="px-4 py-3">
          <div className="text-sm text-white/80 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {car.description}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

