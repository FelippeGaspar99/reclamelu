"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getUser } from "../../../lib/api";

const ownerEmail =
  process.env.NEXT_PUBLIC_ADMIN_OWNER_EMAIL || "felippe@luembalagens.com";

export default function AdminPage() {
  const router = useRouter();
  const currentUser = getUser();
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [catalogs, setCatalogs] = useState({
    stores: [],
    complaint_types: [],
    channels: [],
    complaint_statuses: [],
  });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "sac",
    password: "",
  });
  const [catalogForms, setCatalogForms] = useState({
    stores: { name: "", code: "" },
    complaint_types: { name: "", description: "" },
    channels: { name: "" },
    complaint_statuses: { name: "", is_final: 0 },
  });

  useEffect(() => {
    if (currentUser?.role !== "admin" || currentUser?.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
      router.push("/dashboard");
      return;
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = async () => {
    try {
      const [userData, stores, complaint_types, channels, complaint_statuses] =
        await Promise.all([
          apiFetch("/api/users"),
          apiFetch("/api/stores"),
          apiFetch("/api/complaint_types"),
          apiFetch("/api/channels"),
          apiFetch("/api/complaint_statuses"),
        ]);
      setUsers(userData);
      setCatalogs({ stores, complaint_types, channels, complaint_statuses });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({ ...userForm, active: 1 }),
      });
      setUserForm({ name: "", email: "", role: "sac", password: "" });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleUser = async (id, active) => {
    try {
      await apiFetch(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ active: active ? 0 : 1 }),
      });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCatalogSubmit = async (resource, payload) => {
    try {
      await apiFetch(`/api/${resource}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setCatalogForms((f) => ({
        ...f,
        [resource]: Object.fromEntries(
          Object.keys(f[resource]).map((k) => [k, ""])
        ),
      }));
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCatalog = async (resource, id) => {
    try {
      await apiFetch(`/api/${resource}/${id}`, { method: "DELETE" });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase text-slate-400">Administração</p>
        <h2 className="heading text-2xl font-semibold text-white">
          Usuários e catálogos
        </h2>
      </div>
      {error && (
        <div className="glass-panel p-4 text-rose-200 border border-rose-500/40">
          {error}
        </div>
      )}
      <section className="glass-panel p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Usuários</h3>
          <span className="text-slate-400 text-sm">
            admin/sac/viewer com status ativo/inativo
          </span>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Nome</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Papel</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-2 text-white">{u.name}</td>
                  <td className="px-3 py-2 text-slate-300">{u.email}</td>
                  <td className="px-3 py-2 text-slate-300">{u.role}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        u.active
                          ? "bg-emerald-500/20 text-emerald-100"
                          : "bg-slate-500/20 text-slate-200"
                      }`}
                    >
                      {u.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleUser(u.id, u.active)}
                      className="text-sky-200 underline"
                    >
                      {u.active ? "Desativar" : "Reativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          onSubmit={handleUserSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <input
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            placeholder="Nome"
            value={userForm.name}
            onChange={(e) =>
              setUserForm((f) => ({ ...f, name: e.target.value }))
            }
            required
          />
          <input
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) =>
              setUserForm((f) => ({ ...f, email: e.target.value }))
            }
            required
          />
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            value={userForm.role}
            onChange={(e) =>
              setUserForm((f) => ({ ...f, role: e.target.value }))
            }
          >
            <option value="admin">Administrador</option>
            <option value="sac">Suporte</option>
            <option value="viewer">Visualizador</option>
          </select>
          <input
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            placeholder="Senha"
            type="password"
            value={userForm.password}
            onChange={(e) =>
              setUserForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-emerald-400 text-slate-900 font-semibold"
            >
              Criar usuário
            </button>
          </div>
        </form>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["stores", "complaint_types", "channels", "complaint_statuses"].map(
          (resource) => (
            <CatalogCard
              key={resource}
              title={resource}
              items={catalogs[resource]}
              form={catalogForms[resource]}
              onChangeForm={(payload) =>
                setCatalogForms((f) => ({ ...f, [resource]: payload }))
              }
              onSubmit={(payload) => handleCatalogSubmit(resource, payload)}
              onDelete={(id) => deleteCatalog(resource, id)}
            />
          )
        )}
      </section>
    </div>
  );
}

function CatalogCard({ title, items = [], form, onChangeForm, onSubmit, onDelete }) {
  const friendly = {
    stores: "Lojas",
    complaint_types: "Tipos de reclamação",
    channels: "Canais",
    complaint_statuses: "Status",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{friendly[title]}</h3>
        <span className="text-slate-400 text-xs uppercase">{title}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        {items.map((item) => (
          <span
            key={item.id}
            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2"
          >
            {item.name}
            <button
              onClick={() => onDelete(item.id)}
              className="text-rose-300 hover:text-rose-200"
            >
              ×
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-slate-400 text-sm">Sem itens</span>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          placeholder="Nome"
          value={form.name || ""}
          onChange={(e) => onChangeForm({ ...form, name: e.target.value })}
          required
        />
        {"code" in form && (
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            placeholder="Código (opcional)"
            value={form.code || ""}
            onChange={(e) => onChangeForm({ ...form, code: e.target.value })}
          />
        )}
        {"description" in form && (
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            placeholder="Descrição"
            value={form.description || ""}
            onChange={(e) =>
              onChangeForm({ ...form, description: e.target.value })
            }
          />
        )}
        {"is_final" in form && (
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.is_final === 1 || form.is_final === true}
              onChange={(e) =>
                onChangeForm({ ...form, is_final: e.target.checked ? 1 : 0 })
              }
            />
            Status final?
          </label>
        )}
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/10 hover:bg-white/15"
        >
          Adicionar
        </button>
      </form>
    </div>
  );
}
