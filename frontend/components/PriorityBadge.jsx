"use client";

import { priorityLabel } from "../lib/i18n";

const colorMap = {
  low: "bg-emerald-500/15 text-emerald-100 border-emerald-400/30",
  medium: "bg-amber-400/15 text-amber-100 border-amber-400/30",
  high: "bg-orange-500/20 text-orange-100 border-orange-400/40",
  critical: "bg-rose-500/20 text-rose-100 border-rose-500/40",
};

export default function PriorityBadge({ priority }) {
  const style =
    colorMap[priority] ||
    "bg-slate-500/15 text-slate-200 border-slate-400/30";
  return (
    <span className={`text-xs px-3 py-1 rounded-full border ${style}`}>
      {priorityLabel(priority)}
    </span>
  );
}
