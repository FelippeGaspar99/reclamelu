"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import { formatDate } from "../../../../lib/format";

const diasClasse = (dias) => {
  if (dias === null || dias === undefined) return "text-slate-200";
  if (dias === 0) return "text-rose-200 font-semibold";
  if (dias >= 15) return "text-emerald-200 font-semibold";
  return "text-slate-200";
};

export default function DiasSemReclamacoesPage() {
  const [storesRaw, setStoresRaw] = useState([]);
  const [typesRaw, setTypesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [storeFilters, setStoreFilters] = useState({
    minDays: "",
    onlyActive: false,
    search: "",
    sort: "dias",
  });
  const [typeFilters, setTypeFilters] = useState({
    minDays: "",
    onlyActive: false,
    search: "",
    sort: "dias",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [stores, types] = await Promise.all([
          apiFetch("/api/metrics/days-without-complaints/by-store"),
          apiFetch("/api/metrics/days-without-complaints/by-type"),
        ]);
        setStoresRaw(stores.data || []);
        setTypesRaw(types.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const applyFilters = (data, filters, nameKey) => {
    let list = [...data];
    if (filters.onlyActive) {
      list = list.filter((item) => item.active);
    }
    if (filters.minDays !== "") {
      const min = Number(filters.minDays);
      list = list.filter((item) => {
        if (item.days_without_complaints === null) return false;
        return item.days_without_complaints >= min;
      });
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((item) =>
        (item[nameKey] || "").toLowerCase().includes(q)
      );
    }
    if (filters.sort === "dias") {
      list.sort((a, b) => {
        const ad = a.days_without_complaints;
        const bd = b.days_without_complaints;
        if (ad === null && bd === null) return 0;
        if (ad === null) return 1;
        if (bd === null) return -1;
        return bd - ad;
      });
    } else {
      list.sort((a, b) => (a[nameKey] || "").localeCompare(b[nameKey] || ""));
    }
    return list;
  };

  const stores = useMemo(
    () => applyFilters(storesRaw, storeFilters, "store_name"),
    [storesRaw, storeFilters]
  );
  const types = useMemo(
    () => applyFilters(typesRaw, typeFilters, "complaint_type_name"),
    [typesRaw, typeFilters]
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase text-slate-400">Painel</p>
        <h2 className="heading text-2xl font-semibold text-white">
          Dias sem reclamações
        </h2>
        <p className="text-slate-300 text-sm">
          Médias baseadas na data de abertura (opened_at) das reclamações.
        </p>
      </div>

      {loading && (
        <div className="glass-panel p-4 text-slate-200">Carregando...</div>
      )}
      {error && (
        <div className="glass-panel p-4 text-rose-200 border border-rose-500/40">
          Erro ao carregar dados: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Stores */}
          <section className="glass-panel p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-white font-semibold">
                  Dias sem reclamações por loja
                </h3>
                <p className="text-sm text-slate-400">
                  Inclui lojas sem histórico de reclamações.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="number"
                  min="0"
                  value={storeFilters.minDays}
                  onChange={(e) =>
                    setStoreFilters((f) => ({ ...f, minDays: e.target.value }))
                  }
                  placeholder="Filtrar por mínimo de dias"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white w-48"
                />
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={storeFilters.onlyActive}
                    onChange={(e) =>
                      setStoreFilters((f) => ({
                        ...f,
                        onlyActive: e.target.checked,
                      }))
                    }
                  />
                  Somente lojas ativas
                </label>
                <input
                  value={storeFilters.search}
                  onChange={(e) =>
                    setStoreFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  placeholder="Buscar por nome da loja"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white w-60"
                />
                <select
                  value={storeFilters.sort}
                  onChange={(e) =>
                    setStoreFilters((f) => ({ ...f, sort: e.target.value }))
                  }
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  <option value="dias">Ordenar por dias sem reclamações</option>
                  <option value="nome">Ordenar por nome da loja</option>
                </select>
              </div>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Loja</th>
                    <th className="px-3 py-2 text-left">Dias sem reclamações</th>
                    <th className="px-3 py-2 text-left">Última reclamação</th>
                    <th className="px-3 py-2 text-left">
                      Nunca teve reclamações?
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stores.map((s) => (
                    <tr key={s.store_id}>
                      <td className="px-3 py-2 text-white">{s.store_name}</td>
                      <td className={`px-3 py-2 ${diasClasse(s.days_without_complaints)}`}>
                        {s.days_without_complaints ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-200">
                        {s.last_complaint_date
                          ? formatDate(s.last_complaint_date)
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-200">
                        {s.never_had_complaints ? "Sim" : "Não"}
                      </td>
                    </tr>
                  ))}
                  {stores.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-3 py-4 text-center text-slate-400"
                      >
                        Nenhum resultado encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Types */}
          <section className="glass-panel p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-white font-semibold">
                  Dias sem reclamações por tipo
                </h3>
                <p className="text-sm text-slate-400">
                  Inclui tipos sem histórico de reclamações.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="number"
                  min="0"
                  value={typeFilters.minDays}
                  onChange={(e) =>
                    setTypeFilters((f) => ({ ...f, minDays: e.target.value }))
                  }
                  placeholder="Filtrar por mínimo de dias"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white w-48"
                />
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={typeFilters.onlyActive}
                    onChange={(e) =>
                      setTypeFilters((f) => ({
                        ...f,
                        onlyActive: e.target.checked,
                      }))
                    }
                  />
                  Somente tipos ativos
                </label>
                <input
                  value={typeFilters.search}
                  onChange={(e) =>
                    setTypeFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  placeholder="Buscar por tipo"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white w-60"
                />
                <select
                  value={typeFilters.sort}
                  onChange={(e) =>
                    setTypeFilters((f) => ({ ...f, sort: e.target.value }))
                  }
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  <option value="dias">Ordenar por dias</option>
                  <option value="nome">Ordenar por tipo</option>
                </select>
              </div>
            </div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Tipo de reclamação</th>
                    <th className="px-3 py-2 text-left">Dias sem reclamações</th>
                    <th className="px-3 py-2 text-left">Última reclamação</th>
                    <th className="px-3 py-2 text-left">
                      Nunca teve reclamações?
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {types.map((t) => (
                    <tr key={t.complaint_type_id}>
                      <td className="px-3 py-2 text-white">
                        {t.complaint_type_name}
                      </td>
                      <td className={`px-3 py-2 ${diasClasse(t.days_without_complaints)}`}>
                        {t.days_without_complaints ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-200">
                        {t.last_complaint_date
                          ? formatDate(t.last_complaint_date)
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-200">
                        {t.never_had_complaints ? "Sim" : "Não"}
                      </td>
                    </tr>
                  ))}
                  {types.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-3 py-4 text-center text-slate-400"
                      >
                        Nenhum resultado encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
