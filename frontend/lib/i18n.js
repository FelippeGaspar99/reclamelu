export const statusLabelMap = {
  New: "Novo",
  "In Progress": "Em andamento",
  "Waiting for Customer": "Aguardando cliente",
  Resolved: "Resolvido",
  "Closed Without Solution": "Fechado sem solução",
  Canceled: "Cancelado",
  Novo: "Novo",
  "Em andamento": "Em andamento",
  "Aguardando cliente": "Aguardando cliente",
  Resolvido: "Resolvido",
  "Fechado sem solução": "Fechado sem solução",
  Cancelado: "Cancelado",
};

export function statusLabel(status) {
  return statusLabelMap[status] || status || "-";
}

const statusKeyMap = {
  New: "new",
  "In Progress": "in_progress",
  "Waiting for Customer": "waiting",
  Resolved: "resolved",
  "Closed Without Solution": "closed_no_solution",
  Canceled: "canceled",
  Novo: "new",
  "Em andamento": "in_progress",
  "Aguardando cliente": "waiting",
  Resolvido: "resolved",
  "Fechado sem solução": "closed_no_solution",
  Cancelado: "canceled",
};

export function statusKey(status) {
  return statusKeyMap[status] || (status ? status.toLowerCase() : "");
}

const priorityLabelMap = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

export function priorityLabel(priority) {
  return priorityLabelMap[priority] || priority || "-";
}

const roleLabelMap = {
  admin: "Administrador",
  sac: "Suporte",
  viewer: "Visualizador",
};

export function roleLabel(role) {
  return roleLabelMap[role] || role || "-";
}

const interactionLabelMap = {
  internal_note: "Nota interna",
  customer_reply: "Retorno do cliente",
  status_change: "Mudança de status",
};

export function interactionLabel(type) {
  return interactionLabelMap[type] || type || "-";
}
