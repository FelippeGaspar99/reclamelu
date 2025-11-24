"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import { formatDate } from "../../../../lib/format";

const classeDias = (dias) => {
  if (dias === null || dias === undefined) return "text-slate-200";
  if (dias === 0) return "text-rose-200 font-semibold";
  if (dias >= 15) return "text-emerald-200 font-semibold";
  return "text-slate-200";
};

export default function RecordeDiasSemReclamacoesPage() {
  const [globalRecord, setGlobalRecord] = useState(null);
  const [storesRaw, setStoresRaw] = useState([]);
  const [typesRaw, setTypesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [global, stores, types] = await Promise.all([
          apiFetch("/api/metrics/record-days-without-complaints/global"),
          apiFetch("/api/metrics/record-days-without-complaints/by-store"),
          apiFetch("/api/metrics/record-days-without-complaints/by-type"),
        ]);
        setGlobalRecord(global);
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

  const stores = useMemo(() => [...storesRaw], [storesRaw]);
  const types = useMemo(() => [...typesRaw], [typesRaw]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase text-slate-400">Painel</p>
        <h2 className="heading text-2xl font-semibold text-white">
          Recorde de dias sem reclamações
        </h2>
        <p className="text-slate-300 text-sm">
          Calculado a partir dos intervalos entre as datas de abertura das
          reclamações.
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
          <section className="glass-panel p-4 space-y-2">
            <h3 className="text-white font-semibold">
              Recorde global de dias sem reclamações
            </h3>
            {globalRecord?.record_days_without_complaints === null ? (
              <p className="text-slate-300 text-sm">
                Ainda não há dados suficientes para calcular o recorde.
              </p>
            ) : (
              <div className="text-slate-200 text-sm">
                Recorde:{" "}
                <span className="text-emerald-200 font-semibold">
                  {globalRecord?.record_days_without_complaints} dias
                </span>{" "}
                (de{" "}
                {globalRecord?.record_start_date
                  ? formatDate(globalRecord.record_start_date)
                  : "—"}{" "}
                a{" "}
                {globalRecord?.record_end_date
                  ? formatDate(globalRecord.record_end_date)
                  : "—"}
                )
              </div>
            )}
          </section>

          {/* Recorde por loja */}
          <section className="glass-panel p-4 space-y-3">
            <h3 className="text-white font-semibold">
              Recorde por loja
            </h3>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Loja</th>
                    <th className="px-3 py-2 text-left">
                      Recorde de dias sem reclamações
                    </th>
                    <th className="px-3 py-2 text-left">Início do recorde</th>
                    <th className="px-3 py-2 text-left">Fim do recorde</th>
                    <th className="px-3 py-2 text-left">
                      Nunca teve reclamações?
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stores.map((s) => (
                    <tr key={s.store_id}>
                      <td className="px-3 py-2 text-white">{s.store_name}</td>
                      <td className={`px-3 py-2 ${classeDias(s.record_days_without_complaints)}`}>
                        {s.record_days_without_complaints ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-200">
                        {s.record_start_date
                          ? formatDate(s.record_start_date)
                          : s.never_had_complaints
                          ? "Sem dados — nunca houve reclamações"
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-200">
                        {s.record_end_date
                          ? formatDate(s.record_end_date)
                          : s.never_had_complaints
                          ? "Sem dados — nunca houve reclamações"
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
                        colSpan="5"
                        className="px-3 py-4 text-center text-slate-400"
                      >
                        Nenhum dado encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recorde por tipo */}
          <section className="glass-panel p-4 space-y-3">
            <h3 className="text-white font-semibold">
              Recorde por tipo de reclamação
            </h3>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Tipo de reclamação</th>
                    <th className="px-3 py-2 text-left">
                      Recorde de dias sem reclamações
                    </th>
                    <th className="px-3 py-2 text-left">Início do recorde</th>
                    <th className="px-3 py-2 text-left">Fim do recorde</th>
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
                      <td className={`px-3 py-2 ${classeDias(t.record_days_without_complaints)}`}>
                        {t.record_days_without_complaints ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-200">
                        {t.record_start_date
                          ? formatDate(t.record_start_date)
                          : t.never_had_complaints
                          ? "Sem dados — nunca houve reclamações"
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-200">
                        {t.record_end_date
                          ? formatDate(t.record_end_date)
                          : t.never_had_complaints
                          ? "Sem dados — nunca houve reclamações"
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
                        colSpan="5"
                        className="px-3 py-4 text-center text-slate-400"
                      >
                        Nenhum dado encontrado.
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
