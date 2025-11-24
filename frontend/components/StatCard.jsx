"use client";

export default function StatCard({ title, value, subtitle, accent }) {
  return (
    <div className="glass-panel p-4 rounded-xl border border-white/5">
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {title}
      </div>
      <div className="heading text-2xl font-semibold text-white mt-2">
        {value}
      </div>
      <div className="text-sm text-slate-400">{subtitle}</div>
      {accent && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-emerald-400"
            style={{ width: accent }}
          />
        </div>
      )}
    </div>
  );
}
