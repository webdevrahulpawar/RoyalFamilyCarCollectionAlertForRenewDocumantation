import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Modal({ open, title, onClose, children, footer }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-royal-panel2 shadow-royal"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="font-semibold royal-glow">{title}</div>
              <button
                className="rounded-lg px-2 py-1 text-white/70 hover:text-white"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
            {footer ? <div className="border-t border-white/10 px-5 py-4">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

