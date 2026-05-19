import { useState } from "react"
import LoginPage from "./pages/LoginPage"
import RobotGrid from "./components/RobotGrid"
import StatusBar from "./components/StatusBar"
import Controls from "./components/Controls"
import MissionLog from "./components/MissionLog"
import { useTelemetry } from "./hooks/useTelemetry"
import { logout } from "./api"

function Dashboard({ user, onLogout }) {
  const { telemetry, connected } = useTelemetry()

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.logo}>R</span>
          <span style={styles.brandName}>Robot Dashboard</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.userBadge}>
            {user.username} · <span style={{ color: user.role === "commander" ? "#00ff88" : "#888" }}>{user.role}</span>
          </span>
          <button style={styles.logoutBtn} onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <main style={styles.main}>
        <StatusBar telemetry={telemetry} connected={connected} />
        <div style={styles.grid}>
          <div style={styles.left}>
            <RobotGrid telemetry={telemetry} />
          </div>
          <div style={styles.right}>
            <Controls role={user.role} />
            <MissionLog />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const stored = sessionStorage.getItem("token")
  const [user, setUser] = useState(
    stored ? { username: sessionStorage.getItem("username"), role: sessionStorage.getItem("role") } : null
  )

  function handleLogin(data) {
    setUser({ username: data.username, role: data.role })
  }

  function handleLogout() {
    logout()
    setUser(null)
  }

  if (!user) return <LoginPage onLogin={handleLogin} />
  return <Dashboard user={user} onLogout={handleLogout} />
}

const styles = {
  page: { minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #1a1a2a", background: "#0d0d14" },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  logo: { fontSize: 24, color: "#00ff88" },
  brandName: { fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 16, color: "#fff" },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  userBadge: { fontSize: 13, color: "#888", fontFamily: "'Space Mono', monospace" },
  logoutBtn: { background: "none", border: "1px solid #2a2a3a", borderRadius: 8, padding: "5px 12px", color: "#666", fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace" },
  main: { padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 },
  grid: { display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "start" },
  left: {},
  right: { display: "flex", flexDirection: "column", gap: 16 },
}
