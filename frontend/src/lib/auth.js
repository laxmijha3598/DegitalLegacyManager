import { apiFetch, setToken } from "./api.js";

export function getUser() {
  const raw = localStorage.getItem("dlm_user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  if (!user) localStorage.removeItem("dlm_user");
  else localStorage.setItem("dlm_user", JSON.stringify(user));
}

export async function login(email, password) {
  const data = await apiFetch("/api/auth/login", { method: "POST", body: { email, password } });
  setToken(data.token);
  setUser(data.user);
  return data.user;
}

export async function register(name, email, password) {
  const data = await apiFetch("/api/auth/register", { method: "POST", body: { name, email, password } });
  setToken(data.token);
  setUser(data.user);
  return data.user;
}

export async function fetchMe() {
  const data = await apiFetch("/api/auth/me");
  setUser(data.user);
  return data.user;
}

export function logout() {
  setToken(null);
  setUser(null);
}

