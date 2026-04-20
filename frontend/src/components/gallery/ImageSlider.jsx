import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ImageSlider({ images = [] }) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [idx, setIdx] = useState(0);

  const current = safeImages[idx] || null;

  if (!current) {
    return (
      <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center text-white/50">
        No images
      </div>
    );
  }

  function prev() {
    setIdx((i) => (i - 1 + safeImages.length) % safeImages.length);
  }
  function next() {
    setIdx((i) => (i + 1) % safeImages.length);
  }

  return (
    <div className="relative aspect-[4/3] rounded-2xl border border-white/10 overflow-hidden bg-black/20">
      <AnimatePresence mode="wait">
        <motion.img
          key={current.url}
          src={current.url}
          alt={current.alt || "Car image"}
          loading="lazy"
          className="h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />

      {safeImages.length > 1 ? (
        <>
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 px-3 py-1 text-white"
            onClick={prev}
          >
            ‹
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/45 hover:bg-black/60 border border-white/10 px-3 py-1 text-white"
            onClick={next}
          >
            ›
          </button>

          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            {safeImages.slice(0, 4).map((im, i) => {
              const realIndex = i;
              const active = realIndex === idx;
              return (
                <button
                  key={im.url}
                  onClick={() => setIdx(realIndex)}
                  className={`h-2 flex-1 rounded-full transition ${
                    active ? "bg-royal-gold" : "bg-white/25 hover:bg-white/35"
                  }`}
                  aria-label={`Slide ${realIndex + 1}`}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

