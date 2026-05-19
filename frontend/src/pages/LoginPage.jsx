import { useState } from "react"
import { login, register } from "../api"

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("viewer")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") {
        const data = await login(username, password)
        onLogin(data)
      } else {
        await register(username, password, role)
        const data = await login(username, password)
        onLogin(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>⬡</div>
          <h1 style={styles.title}>Robot Dashboard</h1>
          <p style={styles.sub}>Robot Management System</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {mode === "register" && (
            <select style={styles.input} value={role} onChange={e => setRole(e.target.value)}>
              <option value="viewer">Viewer (read-only)</option>
              <option value="commander">Commander (can move robot)</option>
            </select>
          )}
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Sign in" : "Register"}
          </button>
        </form>
        <button style={styles.toggle} onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Create an account" : "Back to sign in"}
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f" },
  card: { background: "#111118", border: "1px solid #2a2a3a", borderRadius: 16, padding: "2.5rem", width: 360 },
  header: { textAlign: "center", marginBottom: "2rem" },
  logo: { fontSize: 48, color: "#00ff88", lineHeight: 1 },
  title: { margin: "0.5rem 0 0.25rem", fontFamily: "'Space Mono', monospace", color: "#fff", fontSize: 22 },
  sub: { margin: 0, color: "#666", fontSize: 13 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" },
  error: { background: "#2a0a0a", border: "1px solid #ff4444", borderRadius: 8, padding: "8px 12px", color: "#ff6666", fontSize: 13 },
  btn: { background: "#00ff88", border: "none", borderRadius: 8, padding: "11px", fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#000", marginTop: 4 },
  toggle: { background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginTop: "1.5rem", width: "100%", textAlign: "center" },
}
