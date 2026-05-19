import { useEffect, useState } from "react"
import { getMap } from "../api"

const GRID_SIZE = 21
const CELL = 22

export default function RobotGrid({ telemetry }) {
  const [obstacles, setObstacles] = useState(new Set())

  useEffect(() => {
    getMap().then(data => {
      const obs = new Set()
      if (data.grid) {
        data.grid.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell === 1) obs.add(`${x},${y}`)
          })
        })
      }
      setObstacles(obs)
    }).catch(() => {})
  }, [])

  const robotX = telemetry?.position?.x ?? 0
  const robotY = telemetry?.position?.y ?? 0

  return (
    <div style={styles.wrap}>
      <div style={styles.label}>Live Map View</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL}px)`, gap: 1 }}>
        {Array.from({ length: GRID_SIZE }, (_, row) =>
          Array.from({ length: GRID_SIZE }, (_, col) => {
            const isRobot = col === robotX && row === robotY
            const isObstacle = obstacles.has(`${col},${row}`)
            const isCharger = col === 0 && row === 0
            return (
              <div
                key={`${col},${row}`}
                title={`(${col},${row})`}
                style={{
                  width: CELL, height: CELL,
                  borderRadius: 3,
                  background: isRobot ? "#00ff88"
                    : isObstacle ? "#2a2a3a"
                    : isCharger ? "#1a2a1a"
                    : "#13131f",
                  border: isRobot ? "2px solid #00cc66"
                    : isCharger ? "1px solid #00ff8844"
                    : "1px solid #1a1a2a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: isRobot ? "#000" : "#333",
                  fontFamily: "'Space Mono', monospace",
                  transition: "background 0.2s",
                }}
              >
                {isRobot ? "R" : isCharger && !isRobot ? "⚡" : ""}
              </div>
            )
          })
        )}
      </div>
      <div style={styles.legend}>
        <span style={styles.dot("#00ff88")} /> Robot &nbsp;
        <span style={styles.dot("#2a2a3a")} /> Obstacle &nbsp;
        <span style={styles.dot("#1a2a1a")} /> Charger (0,0)
      </div>
    </div>
  )
}

const styles = {
  wrap: { background: "#111118", border: "1px solid #2a2a3a", borderRadius: 12, padding: 16 },
  label: { fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#666", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 },
  legend: { marginTop: 10, fontSize: 12, color: "#666", display: "flex", alignItems: "center", gap: 4 },
  dot: (bg) => ({ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: bg }),
}
