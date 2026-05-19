const BASE = ""  // proxied via Vite

function getToken() {
  return sessionStorage.getItem("token")
}

async function apiFetch(path, options = {}) {
  const token = getToken()
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || "Request failed")
  }
  return res.json()
}

export async function login(username, password) {
  const form = new URLSearchParams({ username, password })
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  })
  if (!res.ok) throw new Error("Invalid credentials")
  const data = await res.json()
  sessionStorage.setItem("token", data.access_token)
  sessionStorage.setItem("role", data.role)
  sessionStorage.setItem("username", data.username)
  return data
}

export async function register(username, password, role) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, role }),
  })
}

export async function move(x, y) {
  return apiFetch("/robot/move", { method: "POST", body: JSON.stringify({ x, y }) })
}

export async function resetRobot() {
  return apiFetch("/robot/reset", { method: "POST", body: JSON.stringify({}) })
}

export async function getMap() {
  return apiFetch("/robot/map")
}

export async function getLogs() {
  return apiFetch("/robot/logs")
}

export function logout() {
  sessionStorage.clear()
}
