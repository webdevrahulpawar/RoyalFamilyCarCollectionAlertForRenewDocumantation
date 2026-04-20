import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/cars", label: "Cars" },
  { to: "/admin/cars/new", label: "Add Car" },
  { to: "/admin/notifications", label: "Notifications" },
];

export default function AdminShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("admin_token");
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/10 bg-royal-panel2/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-royal-gold/90">Royal Admin</div>
            <div className="text-lg font-semibold royal-glow">Car Collection Manager</div>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white/80 hover:text-white hover:border-white/20"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[220px,1fr]">
        <aside className="rounded-2xl border border-white/10 bg-royal-panel2 p-4 shadow-royal">
          <div className="text-xs uppercase tracking-widest text-royal-gold/90">Menu</div>
          <div className="mt-4 space-y-2">
            {nav.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`block rounded-xl px-3 py-2 text-sm transition ${
                    active ? "bg-black/40 text-white border border-royal-gold/25" : "text-white/70 hover:text-white hover:bg-black/25"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

