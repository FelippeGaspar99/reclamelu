"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api";

export default function NewComplaintPage() {
  const router = useRouter();
  const [options, setOptions] = useState({
    stores: [],
    channels: [],
    types: [],
    statuses: [],
    users: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_contact: "",
    store_id: "",
    channel_id: "",
    complaint_type_id: "",
    status_id: 1,
    priority: "medium",
    title: "",
    description: "",
    order_id: "",
    assigned_to_user_id: "",
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [stores, channels, types, statuses, users] = await Promise.all([
          apiFetch("/api/stores"),
          apiFetch("/api/channels"),
          apiFetch("/api/complaint_types"),
          apiFetch("/api/complaint_statuses"),
          apiFetch("/api/users"),
        ]);
        setOptions({ stores, channels, types, statuses, users });
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { ...form };
      if (!payload.assigned_to_user_id) delete payload.assigned_to_user_id;
      const resp = await apiFetch("/api/complaints", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push(`/complaints/${resp.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase text-slate-400">Reclamações</p>
        <h2 className="heading text-2xl font-semibold text-white">
          Nova reclamação
        </h2>
      </div>
      <form
        onSubmit={submit}
        className="glass-panel p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Cliente</label>
          <input
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            value={form.customer_name}
            onChange={(e) => handleChange("customer_name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Contato</label>
          <input
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            value={form.customer_contact}
            onChange={(e) => handleChange("customer_contact", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Loja</label>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            value={form.store_id}
            onChange={(e) => handleChange("store_id", e.target.value)}
            required
          >
            <option value="">Selecione</option>
            {options.stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Canal</label>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            value={form.channel_id}
            onChange={(e) => handleChange("channel_id", e.target.value)}
            required
          >
            <option value="">Selecione</option>
            {options.channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Tipo</label>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            value={form.complaint_type_id}
            onChange={(e) =>
              handleChange("complaint_type_id", e.target.value)
            }
            required
          >
            <option value="">Selecione</option>
            {options.types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Prioridade</label>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            value={form.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Pedido (opcional)</label>
          <input
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            value={form.order_id}
            onChange={(e) => handleChange("order_id", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Responsável (SAC)</label>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            value={form.assigned_to_user_id}
            onChange={(e) =>
              handleChange("assigned_to_user_id", e.target.value)
            }
          >
            <option value="">Não atribuído</option>
            {options.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm text-slate-300">Título</label>
          <input
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm text-slate-300">Descrição</label>
          <textarea
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white min-h-[8rem]"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
          />
        </div>
        {error && (
          <div className="md:col-span-2 text-rose-200 bg-rose-500/10 border border-rose-400/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div className="md:col-span-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/complaints")}
            className="px-4 py-2 rounded-lg border border-white/10 text-slate-200 hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-emerald-400 text-slate-900 font-semibold"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
