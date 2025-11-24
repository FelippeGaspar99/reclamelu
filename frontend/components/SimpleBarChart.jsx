"use client";

export default function SimpleBarChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.total || 0), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.name} className="text-sm text-slate-200">
          <div className="flex justify-between mb-1">
            <span>{item.name}</span>
            <span className="text-slate-400">{item.total}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
              style={{ width: `${(item.total / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {data.length === 0 && (
        <div className="text-slate-400 text-sm">Sem dados ainda.</div>
      )}
    </div>
  );
}
