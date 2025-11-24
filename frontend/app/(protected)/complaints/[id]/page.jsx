"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusBadge from "../../../../components/StatusBadge";
import PriorityBadge from "../../../../components/PriorityBadge";
import { apiFetch } from "../../../../lib/api";
import { formatDate } from "../../../../lib/format";
import { interactionLabel, statusLabel } from "../../../../lib/i18n";

export default function ComplaintDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [complaint, setComplaint] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [options, setOptions] = useState({ statuses: [], users: [] });
  const [statusPayload, setStatusPayload] = useState({
    status_id: "",
    message: "",
  });
  const [interactionPayload, setInteractionPayload] = useState({
    type: "internal_note",
    message: "",
  });
  const [assignId, setAssignId] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [detail, inters, statuses, users] = await Promise.all([
        apiFetch(`/api/complaints/${id}`),
        apiFetch(`/api/complaints/${id}/interactions`),
        apiFetch("/api/complaint_statuses"),
        apiFetch("/api/users"),
      ]);
      setComplaint(detail);
      setInteractions(inters);
      setOptions({ statuses, users });
      setStatusPayload((p) => ({ ...p, status_id: detail.status_id }));
      setAssignId(detail.assigned_to_user_id || "");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (id) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/complaints/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(statusPayload),
      });
      setStatusPayload((p) => ({ ...p, message: "" }));
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const addInteraction = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/complaints/${id}/interactions`, {
        method: "POST",
        body: JSON.stringify(interactionPayload),
      });
      setInteractionPayload({ type: "internal_note", message: "" });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateAssign = async () => {
    try {
      await apiFetch(`/api/complaints/${id}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ assigned_to_user_id: assignId || null }),
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!complaint) {
    return (
      <div className="glass-panel p-4">
        {error ? error : "Carregando..."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-slate-400">Reclamação</p>
          <h2 className="heading text-2xl font-semibold text-white">
            {complaint.protocol}
          </h2>
          <p className="text-slate-300">{complaint.title}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={complaint.status_name} />
          <PriorityBadge priority={complaint.priority} />
        </div>
      </div>
      {error && (
        <div className="glass-panel p-4 text-rose-200 border border-rose-500/40">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-4 space-y-3 lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-300">
            <Info label="Cliente" value={complaint.customer_name} />
            <Info label="Contato" value={complaint.customer_contact} />
            <Info label="Loja" value={complaint.store_name} />
            <Info label="Canal" value={complaint.channel_name} />
            <Info label="Tipo" value={complaint.type_name} />
            <Info label="Abertura" value={formatDate(complaint.opened_at)} />
            <Info label="Responsável" value={complaint.assigned_to_name || "-"} />
            <Info
              label="Criado por"
              value={complaint.created_by_name || "-"}
            />
          </div>
          <div>
            <div className="text-sm text-slate-300 mb-1 font-semibold">
              Descrição
            </div>
            <p className="text-slate-200 whitespace-pre-line">
              {complaint.description}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="glass-panel p-4 space-y-2">
            <div className="text-sm text-slate-200 font-semibold">
              Mudar status
            </div>
            <form className="space-y-2" onSubmit={updateStatus}>
              <select
                value={statusPayload.status_id}
                onChange={(e) =>
                  setStatusPayload((p) => ({
                    ...p,
                    status_id: Number(e.target.value),
                  }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                {options.statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {statusLabel(s.name)}
                  </option>
                ))}
              </select>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                placeholder="Comentário (opcional)"
                value={statusPayload.message}
                onChange={(e) =>
                  setStatusPayload((p) => ({ ...p, message: e.target.value }))
                }
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-sky-400 to-emerald-400 text-slate-900 font-semibold py-2"
              >
                Atualizar
              </button>
            </form>
          </div>
          <div className="glass-panel p-4 space-y-2">
            <div className="text-sm text-slate-200 font-semibold">
              Responsável
            </div>
            <select
              value={assignId}
              onChange={(e) => setAssignId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Não atribuído</option>
              {options.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <button
              onClick={updateAssign}
              className="w-full rounded-lg border border-white/10 text-slate-200 py-2 hover:bg-white/5"
            >
              Salvar responsável
            </button>
          </div>
          <div className="glass-panel p-4 space-y-2">
            <div className="text-sm text-slate-200 font-semibold">
              Nova interação
            </div>
            <form className="space-y-2" onSubmit={addInteraction}>
              <select
                value={interactionPayload.type}
                onChange={(e) =>
                  setInteractionPayload((p) => ({
                    ...p,
                    type: e.target.value,
                  }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="internal_note">Nota interna</option>
                <option value="customer_reply">Retorno do cliente</option>
              </select>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                value={interactionPayload.message}
                onChange={(e) =>
                  setInteractionPayload((p) => ({
                    ...p,
                    message: e.target.value,
                  }))
                }
                placeholder="Mensagem"
                required
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-white/10 text-white py-2 border border-white/10 hover:bg-white/15"
              >
                Registrar interação
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="glass-panel p-4">
        <div className="text-sm text-slate-200 font-semibold mb-3">
          Linha do tempo
        </div>
        <div className="space-y-3">
          {interactions.map((i) => (
            <div
              key={i.id}
              className="border-l-2 border-sky-400/60 pl-3 text-sm text-slate-200"
            >
              <div className="flex items-center gap-2">
                <span className="text-sky-200">{i.user_name}</span>
                <span className="text-xs text-slate-400">
                  {formatDate(i.created_at)}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10">
                  {interactionLabel(i.type)}
                </span>
              </div>
              <div className="text-slate-300 whitespace-pre-line">
                {i.message}
              </div>
            </div>
          ))}
          {interactions.length === 0 && (
            <div className="text-slate-400 text-sm">
              Nenhuma interação registrada.
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => router.push("/complaints")}
          className="text-sky-200 underline"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase text-slate-400">{label}</div>
      <div className="text-slate-100">{value || "-"}</div>
    </div>
  );
}
