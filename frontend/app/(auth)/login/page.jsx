"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest, setSession } from "../../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginRequest(email, password);
      setSession(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel max-w-lg w-full p-8">
        <p className="text-sm uppercase text-slate-400">Suporte Interno</p>
        <h1 className="heading text-3xl font-semibold text-white mb-6">
          ReclameLU
        </h1>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
              placeholder="email@empresa.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:border-sky-400 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-400/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-emerald-400 text-slate-900 font-semibold py-3 hover:opacity-90 transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-4">
          Dica: use o admin seed (admin@company.com / admin123) após rodar as
          migrations/seeds.
        </p>
      </div>
    </div>
  );
}
