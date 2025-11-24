"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ownerEmail =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_ADMIN_OWNER_EMAIL || "felippe@luembalagens.com"
    : "felippe@luembalagens.com";

const links = [
  { href: "/dashboard", label: "Painel" },
  { href: "/complaints", label: "Reclamações" },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const isAdmin =
    user?.role === "admin" &&
    user?.email?.toLowerCase() === ownerEmail.toLowerCase();
  return (
    <aside className="w-64 hidden lg:flex flex-col gap-4 text-sm">
      <div className="flex items-center justify-center">
        <img
          src="/logo-reclamelu.png"
          alt="ReclameLU"
          className="w-full max-w-[240px] object-contain"
        />
      </div>
      <nav className="glass-panel p-3 space-y-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 transition ${
                active
                  ? "bg-sky-500/20 text-sky-100 border border-sky-400/30"
                  : "text-slate-200 hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={`block rounded-lg px-3 py-2 transition ${
              pathname.startsWith("/admin")
                ? "bg-sky-500/20 text-sky-100 border border-sky-400/30"
                : "text-slate-200 hover:bg-white/5"
            }`}
          >
            Administração
          </Link>
        )}
      </nav>
      <div className="glass-panel p-4 text-sm text-slate-300">
        <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
          Usuário
        </div>
        <div className="font-semibold text-white">{user?.name}</div>
        <div className="text-xs text-slate-400">{user?.email}</div>
        <div className="mt-2 rounded-full bg-emerald-500/20 text-emerald-200 px-3 py-1 text-xs inline-flex">
          {user?.role === "admin"
            ? "Administrador"
            : user?.role === "sac"
            ? "Suporte"
            : "Visualizador"}
        </div>
      </div>
    </aside>
  );
}
