"use client";

import { statusLabel, statusKey } from "../lib/i18n";

const colorMap = {
  New: "bg-sky-500/20 text-sky-100 border-sky-500/40",
  Novo: "bg-sky-500/20 text-sky-100 border-sky-500/40",
  "In Progress": "bg-amber-400/20 text-amber-100 border-amber-400/40",
  "Em andamento": "bg-amber-400/20 text-amber-100 border-amber-400/40",
  "Waiting for Customer": "bg-fuchsia-400/20 text-fuchsia-100 border-fuchsia-400/40",
  "Aguardando cliente": "bg-fuchsia-400/20 text-fuchsia-100 border-fuchsia-400/40",
  Resolved: "bg-emerald-500/20 text-emerald-100 border-emerald-500/40",
  Resolvido: "bg-emerald-500/20 text-emerald-100 border-emerald-500/40",
  "Closed Without Solution": "bg-rose-500/20 text-rose-100 border-rose-500/40",
  "Fechado sem solução": "bg-rose-500/20 text-rose-100 border-rose-500/40",
  Canceled: "bg-slate-500/20 text-slate-200 border-slate-400/40",
  Cancelado: "bg-slate-500/20 text-slate-200 border-slate-400/40",
};

export default function StatusBadge({ status }) {
  const key = statusKey(status);
  const style =
    colorMap[status] ||
    (key === "resolved"
      ? colorMap.Resolved
      : key === "new"
      ? colorMap.Novo
      : key === "in_progress"
      ? colorMap["Em andamento"]
      : key === "waiting"
      ? colorMap["Aguardando cliente"]
      : "bg-slate-500/20 text-slate-200 border border-slate-400/30");
  return (
    <span className={`text-xs px-3 py-1 rounded-full border ${style}`}>
      {statusLabel(status)}
    </span>
  );
}
