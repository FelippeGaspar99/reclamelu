"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "../../../components/StatCard";
import SimpleBarChart from "../../../components/SimpleBarChart";
import { apiFetch } from "../../../lib/api";
import { statusKey, statusLabel } from "../../../lib/i18n";
import Link from "next/link";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [rangeKey, setRangeKey] = useState("last7");
  const [daysNoComplaints, setDaysNoComplaints] = useState(null);
  const [metricsError, setMetricsError] = useState("");
  const [recordGlobal, setRecordGlobal] = useState(null);
  const [recordError, setRecordError] = useState("");

  const presets = useMemo(
    () => [
      { key: "today", label: "Hoje" },
      { key: "yesterday", label: "Ontem" },
      { key: "last7", label: "Últimos 7 dias" },
      { key: "last15", label: "Últimos 15 dias" },
      { key: "last30", label: "Últimos 30 dias" },
      { key: "thisMonth", label: "Este mês" },
      { key: "lastMonth", label: "Mês passado" },
      { key: "custom", label: "Data personalizada" },
    ],
    []
  );

  const TZ = "America/Sao_Paulo";

  const toZoneDate = (date) =>
    new Date(
      date.toLocaleString("en-US", {
        timeZone: TZ,
      })
    );

  const formatDisplayDate = (value) => {
    if (!value) return "";
    // value vem como YYYY-MM-DD; evitar shift por fuso ao usar new Date()
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  };

  const formatLocalDate = (d) => {
    const zoned = toZoneDate(d);
    const y = zoned.getFullYear();
    const m = String(zoned.getMonth() + 1).padStart(2, "0");
    const day = String(zoned.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayZoned = () => toZoneDate(new Date());

  const dateRange = useMemo(() => {
    const today = todayZoned();
    const format = (d) => formatLocalDate(d);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    switch (rangeKey) {
      case "today":
        return { from: format(today), to: format(today) };
      case "yesterday": {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        return { from: format(y), to: format(y) };
      }
      case "last7": {
        const from = new Date();
        from.setDate(from.getDate() - 6);
        return { from: format(from), to: format(today) };
      }
      case "last15": {
        const from = new Date();
        from.setDate(from.getDate() - 14);
        return { from: format(from), to: format(today) };
      }
      case "last30": {
        const from = new Date();
        from.setDate(from.getDate() - 29);
        return { from: format(from), to: format(today) };
      }
      case "thisMonth":
        return { from: format(startOfMonth), to: format(endOfMonth) };
      case "lastMonth":
        return { from: format(startOfLastMonth), to: format(endOfLastMonth) };
      case "custom":
        return {
          from: customFrom || "",
          to: customTo || "",
        };
      default:
        return {};
    }
  }, [rangeKey, customFrom, customTo]);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (dateRange.from) params.append("date_from", dateRange.from);
        if (dateRange.to) params.append("date_to", dateRange.to);
        const qs = params.toString();
        const data = await apiFetch(
          `/api/dashboard/summary${qs ? `?${qs}` : ""}`
        );
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [dateRange]);

  useEffect(() => {
    apiFetch("/api/metrics/days-without-complaints/global")
      .then(setDaysNoComplaints)
      .catch((err) => setMetricsError(err.message));
    apiFetch("/api/metrics/record-days-without-complaints/global")
      .then(setRecordGlobal)
      .catch((err) => setRecordError(err.message));
  }, []);

  const getCountByStatus = (key) =>
    summary?.by_status?.find((s) => statusKey(s.name) === key)?.total || 0;
  const openComplaints = getCountByStatus("new");
  const resolved = getCountByStatus("resolved");
  const byStatus = (summary?.by_status || []).map((s) => ({
    ...s,
    name: statusLabel(s.name),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-400">Painel</p>
          <h2 className="heading text-2xl font-semibold text-white">
            Visão geral das reclamações
          </h2>
        </div>
      </div>
      <div className="glass-panel p-4 space-y-3">
        <div className="text-sm text-slate-300 font-semibold">
          Filtro por período
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1 sm:col-span-2 max-w-xs">
            <label className="text-xs text-slate-400">Período</label>
            <select
              value={rangeKey}
              onChange={(e) => setRangeKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              {presets.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          {rangeKey === "custom" && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">De</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Até</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </>
          )}
        </div>
        {rangeKey === "custom" && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!customFrom || !customTo) return;
                setRangeKey("custom");
              }}
              className="rounded-lg bg-gradient-to-r from-sky-400 to-emerald-400 text-slate-900 font-semibold px-4 py-2 disabled:opacity-50"
              disabled={!customFrom || !customTo}
            >
              Aplicar
            </button>
            <button
              onClick={() => {
                setCustomFrom("");
                setCustomTo("");
                setRangeKey("last7");
              }}
              className="rounded-lg border border-white/10 px-4 py-2 text-slate-200 hover:bg-white/5"
            >
              Limpar
            </button>
          </div>
        )}
        {dateRange.from && dateRange.to && (
          <div className="text-xs text-slate-400">
            Período:{" "}
            <span className="text-slate-200">
              {formatDisplayDate(dateRange.from)}
            </span>{" "}
            a{" "}
            <span className="text-slate-200">
              {formatDisplayDate(dateRange.to)}
            </span>
          </div>
        )}
      </div>
      {error && (
        <div className="glass-panel p-4 text-rose-200 border border-rose-500/40">
          {error}
        </div>
      )}
      {loading && (
        <div className="glass-panel p-4 text-slate-200">Carregando...</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Reclamações no período"
          value={summary?.total ?? "-"}
          subtitle="Total registrado"
          accent="80%"
        />
        <StatCard
          title="Abertas"
          value={openComplaints}
          subtitle="Status Novo"
          accent="40%"
        />
        <StatCard
          title="Resolvidas"
          value={resolved}
          subtitle="Status Resolvido"
          accent="65%"
        />
        <StatCard
          title="Tempo médio (h)"
          value={
            summary?.avg_resolution_hours
              ? summary.avg_resolution_hours.toFixed(1)
              : "-"
          }
          subtitle="Entre abertura e fechamento"
          accent="55%"
        />
        <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col gap-2">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Dias sem reclamações
          </div>
          <div className="heading text-2xl font-semibold text-white">
            {daysNoComplaints?.days_without_complaints ?? "-"}
          </div>
          <div className="text-sm text-slate-400">
            {daysNoComplaints?.days_without_complaints === 0
              ? "Reclamações hoje"
              : `Última reclamação em: ${
                  daysNoComplaints?.last_complaint_date
                    ? formatDisplayDate(daysNoComplaints.last_complaint_date)
                    : "—"
                }`}
          </div>
        {metricsError && (
          <div className="text-xs text-rose-300">{metricsError}</div>
        )}
        <Link
          href="/dashboard/dias-sem-reclamacoes"
          className="text-sm text-sky-200 underline hover:text-sky-100"
        >
          Ver detalhes
        </Link>
      </div>
      <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col gap-2">
        <div className="text-xs uppercase tracking-wide text-slate-400">
          Recorde de dias sem reclamações
        </div>
        <div className="heading text-2xl font-semibold text-white">
          {recordGlobal?.record_days_without_complaints ?? "-"}
        </div>
        <div className="text-sm text-slate-400">
          {recordGlobal?.record_days_without_complaints === null
            ? "Ainda não há dados suficientes para calcular o recorde."
            : `Recorde: ${recordGlobal?.record_days_without_complaints} dias (de ${
                recordGlobal?.record_start_date
                  ? formatDisplayDate(recordGlobal.record_start_date)
                  : "—"
              } a ${
                recordGlobal?.record_end_date
                  ? formatDisplayDate(recordGlobal.record_end_date)
                  : "—"
              })`}
        </div>
        {recordError && (
          <div className="text-xs text-rose-300">{recordError}</div>
        )}
        <Link
          href="/dashboard/recorde-dias-sem-reclamacoes"
          className="text-sm text-sky-200 underline hover:text-sky-100"
        >
          Ver recordes
        </Link>
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4">
          <div className="text-sm text-slate-300 mb-3 font-semibold">
            Reclamações por status
          </div>
          <SimpleBarChart data={byStatus} />
        </div>
        <div className="glass-panel p-4">
          <div className="text-sm text-slate-300 mb-3 font-semibold">
            Reclamações por tipo
          </div>
          <SimpleBarChart data={summary?.by_type || []} />
        </div>
      </div>
      <div className="glass-panel p-4">
        <div className="text-sm text-slate-300 mb-3 font-semibold">
          Reclamações por loja
        </div>
        <SimpleBarChart data={summary?.by_store || []} />
      </div>
    </div>
  );
}
