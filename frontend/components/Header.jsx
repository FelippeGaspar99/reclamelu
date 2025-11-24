"use client";

import { clearSession, getUser } from "../lib/api";
import { roleLabel } from "../lib/i18n";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const user = getUser();

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <header className="glass-panel flex items-center justify-between px-5 py-3">
      <div>
        <p className="text-xs uppercase text-slate-400">Área interna</p>
        <h1 className="heading text-xl font-semibold text-white">
          Experiência do cliente
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right text-sm">
          <div className="text-white font-semibold">{user?.name}</div>
          <div className="text-slate-400">{roleLabel(user?.role)}</div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 border border-white/10"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
