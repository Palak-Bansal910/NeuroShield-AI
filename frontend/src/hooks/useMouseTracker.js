import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Tracks mouse dynamics:
 *  - movement velocity
 *  - entropy (randomness of movement directions)
 *  - idle periods
 *  - click rhythm
 *  - anomaly score 0–100
 */
export function useMouseTracker(active = true) {
  const [data, setData] = useState({
    velocities: [],
    avgVelocity: 0,
    entropy: 0,          // 0–100 — high = bot-like or chaotic
    totalMoves: 0,
    totalClicks: 0,
    idleSeconds: 0,
    anomalyScore: 0,
  })

  const lastPos      = useRef(null)
  const lastMoveTime = useRef(null)
  const idleTimer    = useRef(null)
  const angles       = useRef([])

  const calcEntropy = (anglesArr) => {
    if (anglesArr.length < 4) return 0
    // Bucket into 8 directions
    const buckets = new Array(8).fill(0)
    anglesArr.forEach((a) => {
      const idx = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 8) % 8
      buckets[idx]++
    })
    const total = anglesArr.length
    // Shannon entropy normalised to 0-100
    const H = buckets.reduce((sum, c) => {
      if (c === 0) return sum
      const p = c / total
      return sum - p * Math.log2(p)
    }, 0)
    return Math.round((H / Math.log2(8)) * 100)
  }

  const onMouseMove = useCallback((e) => {
    if (!active) return
    const now = Date.now()
    const pos = { x: e.clientX, y: e.clientY }

    if (lastPos.current && lastMoveTime.current) {
      const dx   = pos.x - lastPos.current.x
      const dy   = pos.y - lastPos.current.y
      const dt   = now - lastMoveTime.current
      const dist = Math.sqrt(dx * dx + dy * dy)
      const vel  = dt > 0 ? dist / dt : 0
      const angle = Math.atan2(dy, dx)

      angles.current = [...angles.current.slice(-99), angle]
      const entropy = calcEntropy(angles.current)

      setData((prev) => {
        const velocities = [...prev.velocities.slice(-49), vel]
        const avgVelocity = Math.round(
          velocities.reduce((a, b) => a + b, 0) / velocities.length
        )
        // Anomaly: very high avg velocity (bot) or very high entropy (erratic)
        const anomalyScore = Math.min(
          100,
          Math.round(
            (avgVelocity > 3 ? 40 : 0) +
            (entropy > 85 ? 40 : entropy > 65 ? 20 : 0) +
            (prev.idleSeconds > 30 ? 20 : 0)
          )
        )
        return { ...prev, velocities, avgVelocity, entropy, totalMoves: prev.totalMoves + 1, anomalyScore }
      })
    }

    // Reset idle timer
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      setData((prev) => ({ ...prev, idleSeconds: prev.idleSeconds + 1 }))
    }, 1000)

    lastPos.current      = pos
    lastMoveTime.current = now
  }, [active])

  const onMouseClick = useCallback(() => {
    setData((prev) => ({ ...prev, totalClicks: prev.totalClicks + 1 }))
  }, [])

  useEffect(() => {
    return () => clearTimeout(idleTimer.current)
  }, [])

  const reset = useCallback(() => {
    lastPos.current      = null
    lastMoveTime.current = null
    angles.current       = []
    setData({ velocities: [], avgVelocity: 0, entropy: 0, totalMoves: 0, totalClicks: 0, idleSeconds: 0, anomalyScore: 0 })
  }, [])

  return { data, onMouseMove, onMouseClick, reset }
}