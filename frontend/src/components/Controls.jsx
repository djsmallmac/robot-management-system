import { useState } from "react"
import { move, resetRobot } from "../api"

export default function Controls({ role }) {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)

  if (role !== "commander") {
    return (
      <div style={styles.wrap}>
        <div style={styles.label}>Controls</div>
        <p style={styles.muted}>Viewer role — read only. No move commands available.</p>
      </div>
    )
  }

  async function handleMove() {
    setLoading(true)
    setFeedback(null)
    try {
      const res = await move(Number(x), Number(y))
      setFeedback({ ok: true, msg: `Moved → (${x}, ${y}) — ${res.status || "sent"}` })
    } catch (e) {
      setFeedback({ ok: false, msg: e.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleReset() {
    setLoading(true)
    try {
      await resetRobot()
      setFeedback({ ok: true, msg: "Robot reset to (0,0)" })
    } catch (e) {
      setFeedback({ ok: false, msg: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.label}>Move robot</div>
      <div style={styles.row}>
        <div style={styles.field}>
          <span style={styles.fieldLabel}>X (0–20)</span>
          <input style={styles.input} type="number" min={0} max={20} value={x}
            onChange={e => setX(e.target.value)} />
        </div>
        <div style={styles.field}>
          <span style={styles.fieldLabel}>Y (0–20)</span>
          <input style={styles.input} type="number" min={0} max={20} value={y}
            onChange={e => setY(e.target.value)} />
        </div>
        <button style={styles.btn} onClick={handleMove} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
      <button style={styles.resetBtn} onClick={handleReset} disabled={loading}>Return To Base</button>
      {feedback && (
        <div style={styles.feedback(feedback.ok)}>
          {feedback.msg}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { background: "#111118", border: "1px solid #2a2a3a", borderRadius: 12, padding: 16 },
  label: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  muted: { color: "#555", fontSize: 13, margin: 0 },
  row: { display: "flex", gap: 10, alignItems: "flex-end" },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel: { fontSize: 11, color: "#666", fontFamily: "'Space Mono', monospace" },
  input: { background: "#1a1a2a", border: "1px solid #2a2a3a", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 14, width: 80, fontFamily: "'Space Mono', monospace", outline: "none" },
  btn: { background: "#00ff88", border: "none", borderRadius: 8, padding: "9px 20px", fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#000" },
  resetBtn: { marginTop: 10, background: "none", border: "1px solid #2a2a3a", borderRadius: 8, padding: "7px 14px", color: "#888", fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace" },
  feedback: (ok) => ({ marginTop: 10, fontSize: 12, padding: "7px 12px", borderRadius: 8, fontFamily: "'Space Mono', monospace", background: ok ? "#0a2a1a" : "#2a0a0a", color: ok ? "#00ff88" : "#ff6666", border: `1px solid ${ok ? "#00ff8833" : "#ff444433"}` }),
}
