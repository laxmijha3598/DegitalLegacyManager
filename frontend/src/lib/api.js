const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("dlm_token");
}

export function setToken(token) {
  if (!token) localStorage.removeItem("dlm_token");
  else localStorage.setItem("dlm_token", token);
}

export function getApiOrigin() {
  return API_BASE_URL;
}

export async function apiFetch(path, { method = "GET", body, headers, isFormData } = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {})
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = data?.error?.details;
    throw err;
  }
  return data?.data;
}

