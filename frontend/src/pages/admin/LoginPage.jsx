import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../../api/client";
import { motion } from "framer-motion";
import { useToast } from "../../components/toast/ToastProvider";

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin12345");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const r = await api.post("/auth/login", { username, password });
      const token = r.data.token;
      localStorage.setItem("admin_token", token);
      setAuthToken(token);
      toast?.push({ type: "success", title: "Login successful", message: "Welcome to Royal Admin." });
      navigate("/admin/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Login failed");
      toast?.push({ type: "error", title: "Login failed", message: "Check credentials and try again." }, 4500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <div className="mx-auto max-w-lg px-4 py-14">
        <div className="rounded-3xl border border-white/10 bg-royal-panel2 p-7 shadow-royal">
          <div className="text-xs uppercase tracking-widest text-royal-gold/90">Admin Login</div>
          <h1 className="mt-2 text-3xl font-bold royal-glow">Royal Car Collection</h1>
          <p className="mt-2 text-white/70">Secure access for managing galleries and document expiry reminders.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm text-white/70">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-royal-gold/40"
              />
            </div>
            {err ? <div className="rounded-xl border border-royal-danger/40 bg-black/20 px-3 py-2 text-sm text-royal-danger">{err}</div> : null}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-royal-gold to-royal-gold2 px-4 py-2 font-semibold text-black/90 hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

