import { useState, useRef, useCallback } from 'react'

/**
 * Tracks keystroke dynamics:
 *  - dwell time (key held duration)
 *  - flight time (gap between key-up and next key-down)
 *  - average interval
 *  - rhythm variance (std-dev of intervals)
 */
export function useKeystrokeTracker() {
  const [data, setData] = useState({
    intervals: [],       // ms between keystrokes
    dwellTimes: [],      // ms each key was held
    avgInterval: null,
    variance: null,
    totalKeys: 0,
    anomalyScore: 0,     // 0–100
  })

  const lastDownTime = useRef(null)
  const lastUpTime   = useRef(null)
  const keyDownMap   = useRef({})  // key → timestamp

  const stdDev = (arr) => {
    if (arr.length < 2) return 0
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length
    const sq   = arr.map((v) => (v - mean) ** 2)
    return Math.sqrt(sq.reduce((a, b) => a + b, 0) / arr.length)
  }

  const onKeyDown = useCallback((e) => {
    const now = Date.now()
    keyDownMap.current[e.key] = now

    setData((prev) => {
      const intervals = lastDownTime.current
        ? [...prev.intervals.slice(-49), now - lastDownTime.current]
        : prev.intervals

      const avg = intervals.length
        ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
        : null

      const variance = Math.round(stdDev(intervals))

      // Anomaly: very fast (<60ms) or erratic (variance >200ms) → suspicious
      const fastPresses = intervals.filter((i) => i < 60).length
      const anomalyScore = Math.min(
        100,
        Math.round((fastPresses / Math.max(intervals.length, 1)) * 60 + (variance > 200 ? 40 : 0))
      )

      lastDownTime.current = now
      return {
        ...prev,
        intervals,
        avgInterval: avg,
        variance,
        totalKeys: prev.totalKeys + 1,
        anomalyScore,
      }
    })
  }, [])

  const onKeyUp = useCallback((e) => {
    const now  = Date.now()
    const down = keyDownMap.current[e.key]
    if (!down) return

    const dwell = now - down
    delete keyDownMap.current[e.key]

    setData((prev) => ({
      ...prev,
      dwellTimes: [...prev.dwellTimes.slice(-49), dwell],
    }))

    lastUpTime.current = now
  }, [])

  const reset = useCallback(() => {
    lastDownTime.current = null
    lastUpTime.current   = null
    keyDownMap.current   = {}
    setData({ intervals: [], dwellTimes: [], avgInterval: null, variance: null, totalKeys: 0, anomalyScore: 0 })
  }, [])

  return { data, onKeyDown, onKeyUp, reset }
}