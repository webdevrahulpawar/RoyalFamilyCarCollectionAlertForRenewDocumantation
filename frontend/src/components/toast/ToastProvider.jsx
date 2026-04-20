import React, { createContext, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

function ToastView({ toast, onDismiss }) {
  const colors =
    toast.type === "success"
      ? "border-royal-ok text-royal-ok"
      : toast.type === "error"
        ? "border-royal-danger text-royal-danger"
        : "border-royal-gold text-royal-gold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2 }}
      className={`w-full max-w-md rounded-xl border bg-royal-panel2 px-4 py-3 shadow-royal ${colors}`}
      role="status"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{toast.title}</div>
          {toast.message ? <div className="mt-1 text-sm text-white/80">{toast.message}</div> : null}
        </div>
        <button
          className="text-white/70 hover:text-white"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const api = useMemo(
    () => ({
      push: ({ type = "info", title, message = "" }, ttlMs = 3500) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setToasts((t) => [...t, { id, type, title, message }]);
        window.setTimeout(() => {
          setToasts((t) => t.filter((x) => x.id !== id));
        }, ttlMs);
      },
      dismiss: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    }),
    [],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[1000] w-full max-w-md">
        <AnimatePresence>
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto mb-3">
              <ToastView toast={t} onDismiss={api.dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

