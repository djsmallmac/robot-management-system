export default function StatusBar({ telemetry, connected }) {
  const battery = telemetry?.battery ?? null
  const status = telemetry?.status ?? "—"
  const pos = telemetry?.position

  const statusColor = {
    IDLE: "#00ff88", MOVING: "#ffaa00", LOW_BATTERY: "#ff4444",
    STUCK: "#ff6600", UNREACHABLE: "#ff4444",
  }[status] || "#666"

  const batteryColor = battery === null ? "#666" : battery < 20 ? "#ff4444" : battery < 50 ? "#ffaa00" : "#00ff88"

  return (
    <div style={styles.bar}>
      <div style={styles.indicator(connected ? "#00ff88" : "#ff4444")}>
        {connected ? "● Connected" : "● Signal Lost — Reconnecting..."}
      </div>
      <div style={styles.stat}>
        <span style={styles.label}>Status</span>
        <span style={{ ...styles.value, color: statusColor }}>{status}</span>
      </div>
      <div style={styles.stat}>
        <span style={styles.label}>Position</span>
        <span style={styles.value}>{pos ? `(${pos.x}, ${pos.y})` : "—"}</span>
      </div>
      <div style={styles.stat}>
        <span style={styles.label}>Battery</span>
        <div style={styles.batteryWrap}>
          <div style={{ ...styles.batteryFill, width: `${battery ?? 0}%`, background: batteryColor }} />
          <span style={{ ...styles.value, color: batteryColor }}>
            {battery !== null ? `${Math.round(battery)}%` : "—"}
          </span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  bar: { background: "#111118", border: "1px solid #2a2a3a", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" },
  indicator: (color) => ({ fontFamily: "'Space Mono', monospace", fontSize: 12, color, minWidth: 200 }),
  stat: { display: "flex", flexDirection: "column", gap: 2 },
  label: { fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Space Mono', monospace" },
  value: { fontSize: 14, color: "#fff", fontFamily: "'Space Mono', monospace" },
  batteryWrap: { display: "flex", alignItems: "center", gap: 8 },
  batteryFill: { height: 6, borderRadius: 3, transition: "width 0.5s, background 0.5s", minWidth: 60 },
}
