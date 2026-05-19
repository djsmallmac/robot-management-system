import { useEffect, useState, useRef } from "react"

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    let timeout
    function connect() {
      const proto = window.location.protocol === "https:" ? "wss" : "ws"
      const ws = new WebSocket(`${proto}://${window.location.host}/ws/telemetry`)
      wsRef.current = ws
      ws.onopen = () => setConnected(true)
      ws.onclose = () => {
        setConnected(false)
        timeout = setTimeout(connect, 3000)  // reconnect after 3s
      }
      ws.onerror = () => ws.close()
      ws.onmessage = (e) => {
        try { setTelemetry(JSON.parse(e.data)) } catch {}
      }
    }
    connect()
    return () => {
      clearTimeout(timeout)
      wsRef.current?.close()
    }
  }, [])

  return { telemetry, connected }
}
