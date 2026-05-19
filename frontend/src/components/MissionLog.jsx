import { useEffect, useState } from "react"
import { getLogs } from "../api"

export default function MissionLog() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    function fetchLogs() {
      getLogs().then(setLogs).catch(() => {})
    }
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={styles.wrap}>
      <div style={styles.label}>Command History</div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["Timestamp", "User", "Command", "Payload", "Result"].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={5} style={styles.empty}>No commands logged yet</td></tr>
            )}
            {logs.map(log => (
              <tr key={log.id} style={styles.tr}>
                <td style={styles.td}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td style={styles.td}>{log.username}</td>
                <td style={{ ...styles.td, color: "#00ff88", fontFamily: "'Space Mono', monospace" }}>{log.command_type}</td>
                <td style={{ ...styles.td, color: "#888" }}>{log.payload || "—"}</td>
                <td style={styles.td}>{log.result || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const styles = {
  wrap: { background: "#111118", border: "1px solid #2a2a3a", borderRadius: 12, padding: 16 },
  label: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  tableWrap: { overflowY: "auto", maxHeight: 240 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { textAlign: "left", padding: "6px 10px", color: "#555", fontFamily: "'Space Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #2a2a3a" },
  tr: { borderBottom: "1px solid #1a1a2a" },
  td: { padding: "6px 10px", color: "#ccc", verticalAlign: "top" },
  empty: { padding: "16px 10px", color: "#555", textAlign: "center" },
}
