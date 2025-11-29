const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const normalizePath = (path: string): string => {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function setSession(token: string, user: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const base = API_BASE || "";
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const url = `${base}${normalizePath(path)}`;
  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    // ignora parse
  }
  if (!res.ok) {
    console.error("API error", {
      status: res.status,
      url,
      body: text,
    });
    const message = data?.message || "Erro inesperado";
    throw new Error(message);
  }
  return data;
}

export async function loginRequest(email: string, password: string) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
