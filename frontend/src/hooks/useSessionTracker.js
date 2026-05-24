import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Tracks full session behaviour:
 *  - session duration
 *  - tab visibility switches
 *  - copy-paste events
 *  - rapid navigation
 *  - composite session risk score
 */
export function useSessionTracker() {
  const startTime   = useRef(Date.now())
  const [session, setSession] = useState({
    durationSeconds: 0,
    tabSwitches: 0,
    copyPastes: 0,
    focusLost: 0,
    riskScore: 0,        // 0–100
    events: [],          // log of notable events
  })

  // Duration ticker
  useEffect(() => {
    const id = setInterval(() => {
      setSession((prev) => ({
        ...prev,
        durationSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      }))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Tab visibility
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        setSession((prev) => addEvent(prev, 'warn', 'Tab hidden — possible context switch'))
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  // Paste detection
  useEffect(() => {
    const handler = (e) => {
      setSession((prev) => {
        const next = { ...prev, copyPastes: prev.copyPastes + 1 }
        return addEvent(next, 'warn', `Paste detected on field: ${e.target?.name || 'unknown'}`)
      })
    }
    document.addEventListener('paste', handler)
    return () => document.removeEventListener('paste', handler)
  }, [])

  // Focus loss
  useEffect(() => {
    const handler = () => {
      setSession((prev) => {
        const next = { ...prev, focusLost: prev.focusLost + 1 }
        return addEvent(next, 'info', 'Window focus lost')
      })
    }
    window.addEventListener('blur', handler)
    return () => window.removeEventListener('blur', handler)
  }, [])

  const addEvent = (prev, level, msg) => {
    const riskDelta = level === 'danger' ? 15 : level === 'warn' ? 5 : 1
    const riskScore = Math.min(100, prev.riskScore + riskDelta)
    return {
      ...prev,
      riskScore,
      events: [
        { id: Date.now(), level, msg, time: new Date().toLocaleTimeString() },
        ...prev.events.slice(0, 49),
      ],
    }
  }

  const logEvent = useCallback((level, msg) => {
    setSession((prev) => addEvent(prev, level, msg))
  }, [])

  const reset = useCallback(() => {
    startTime.current = Date.now()
    setSession({ durationSeconds: 0, tabSwitches: 0, copyPastes: 0, focusLost: 0, riskScore: 0, events: [] })
  }, [])

  return { session, logEvent, reset }
}