"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "../../../components/StatusBadge";
import PriorityBadge from "../../../components/PriorityBadge";
import { apiFetch } from "@/lib/api";
import { formatDate } from "../../../lib/format";
import { priorityLabel, statusLabel } from "../../../lib/i18n";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({
    status_id: "",
    complaint_type_id: "",
    store_id: "",
    channel_id: "",
    priority: "",
    assigned_to_user_id: "",
    q: "",
  });
  const [options, setOptions] = useState({
    statuses: [],
    types: [],
    stores: [],
    channels: [],
    users: [],
  });
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) query.append(k, v);
    });
    try {
      const data = await apiFetch(`/api/complaints?${query.toString()}`);
      setComplaints(data.data || []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [statuses, types, stores, channels, users] = await Promise.all([
          apiFetch("/api/complaint_statuses"),
          apiFetch("/api/complaint_types"),
          apiFetch("/api/stores"),
          apiFetch("/api/channels"),
          apiFetch("/api/users"),
        ]);
        setOptions({ statuses, types, stores, channels, users });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    loadComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.status_id,
    filters.complaint_type_id,
    filters.store_id,
    filters.channel_id,
    filters.priority,
    filters.assigned_to_user_id,
    filters.q,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-slate-400">Reclamações</p>
          <h2 className="heading text-2xl font-semibold text-white">
            Lista e filtros
          </h2>
        </div>
        <Link
          href="/complaints/new"
          className="rounded-lg bg-gradient-to-r from-sky-400 to-emerald-400 text-slate-900 font-semibold px-4 py-2 hover:opacity-90"
        >
          Nova Reclamação
        </Link>
      </div>
      <div className="glass-panel p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
            value={filters.status_id}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status_id: e.target.value }))
            }
          >
            <option value="">Status</option>
            {options.statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {statusLabel(s.name)}
              </option>
            ))}
          </select>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
            value={filters.complaint_type_id}
            onChange={(e) =>
              setFilters((f) => ({ ...f, complaint_type_id: e.target.value }))
            }
          >
            <option value="">Tipo</option>
            {options.types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
            value={filters.store_id}
            onChange={(e) =>
              setFilters((f) => ({ ...f, store_id: e.target.value }))
            }
          >
            <option value="">Loja</option>
            {options.stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
            value={filters.channel_id}
            onChange={(e) =>
              setFilters((f) => ({ ...f, channel_id: e.target.value }))
            }
          >
            <option value="">Canal</option>
            {options.channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
            value={filters.assigned_to_user_id}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                assigned_to_user_id: e.target.value,
              }))
            }
          >
            <option value="">Responsável</option>
            {options.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
            value={filters.priority}
            onChange={(e) =>
              setFilters((f) => ({ ...f, priority: e.target.value }))
            }
          >
            <option value="">Prioridade</option>
            {["low", "medium", "high", "critical"].map((p) => {
              const label = priorityLabel(p);
              return (
                <option key={p} value={p}>
                  {label}
                </option>
              );
            })}
          </select>
          <input
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-100"
            placeholder="Busca livre..."
            value={filters.q}
            onChange={(e) =>
              setFilters((f) => ({ ...f, q: e.target.value.trim() }))
            }
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={loadComplaints}
            className="text-sm text-sky-200 hover:text-sky-100 underline"
          >
            Atualizar
          </button>
        </div>
      </div>
      {error && (
        <div className="glass-panel p-4 text-rose-200 border border-rose-500/40">
          {error}
        </div>
      )}
      <div className="glass-panel overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-400 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Protocolo</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Loja</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Prioridade</th>
              <th className="text-left px-4 py-3">Responsável</th>
              <th className="text-left px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {complaints.map((c) => (
              <tr key={c.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/complaints/${c.id}`}
                    className="text-sky-200 underline"
                  >
                    {c.protocol}
                  </Link>
                </td>
                <td className="px-4 py-3 text-white">{c.customer_name}</td>
                <td className="px-4 py-3 text-slate-300">{c.store_name}</td>
                <td className="px-4 py-3 text-slate-300">{c.type_name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status_name} />
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={c.priority} />
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {c.assigned_to_name || "-"}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {formatDate(c.opened_at)}
                </td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Nenhuma reclamação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
