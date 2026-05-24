import { useEffect, useRef } from 'react'
import { useKeystrokeTracker } from '../hooks/useKeystrokeTracker'
import { useMouseTracker }     from '../hooks/useMouseTracker'
import { useSessionTracker }   from '../hooks/useSessionTracker'
import { behaviorAPI }         from '../services/api'

/**
 * BehaviorCapture
 * Invisible component — wraps the whole app after login.
 * Attaches global listeners and drains data to the backend every 5 seconds.
 *
 * Props:
 *   sessionId  string
 *   userId     string
 *   onRiskUpdate(score: number)  callback so Dashboard can react
 */
export default function BehaviorCapture({ sessionId, userId, onRiskUpdate, children }) {
  const { data: ks, onKeyDown, onKeyUp }          = useKeystrokeTracker()
  const { data: ms, onMouseMove, onMouseClick }   = useMouseTracker(true)
  const { session, logEvent }                      = useSessionTracker()

  const flushTimer = useRef(null)

  // Attach global listeners
  useEffect(() => {
    window.addEventListener('keydown',   onKeyDown)
    window.addEventListener('keyup',     onKeyUp)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('click',     onMouseClick)
    return () => {
      window.removeEventListener('keydown',   onKeyDown)
      window.removeEventListener('keyup',     onKeyUp)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click',     onMouseClick)
    }
  }, [onKeyDown, onKeyUp, onMouseMove, onMouseClick])

  // Flush to backend every 5 s
  useEffect(() => {
    flushTimer.current = setInterval(async () => {
      if (!sessionId) return
      try {
        const payload = {
          session_id: sessionId,
          user_id:    userId,
          keystroke_data: {
            intervals:    ks.intervals,
            dwell_times:  ks.dwellTimes,
            avg_interval: ks.avgInterval,
            variance:     ks.variance,
            total_keys:   ks.totalKeys,
            anomaly_score: ks.anomalyScore,
          },
          mouse_data: {
            velocities:    ms.velocities,
            avg_velocity:  ms.avgVelocity,
            entropy:       ms.entropy,
            total_moves:   ms.totalMoves,
            total_clicks:  ms.totalClicks,
            anomaly_score: ms.anomalyScore,
          },
          session_data: {
            duration_seconds: session.durationSeconds,
            tab_switches:     session.tabSwitches,
            copy_pastes:      session.copyPastes,
            focus_lost:       session.focusLost,
            risk_score:       session.riskScore,
          },
        }
        const res = await behaviorAPI.sendBatch(payload)
        if (res.data?.risk_score !== undefined) {
          onRiskUpdate?.(res.data.risk_score)
        }
      } catch {
        // Backend offline in demo mode — silently ignore
      }
    }, 5000)

    return () => clearInterval(flushTimer.current)
  }, [sessionId, userId, ks, ms, session, onRiskUpdate])

  return (
    <div
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onMouseMove={onMouseMove}
      onClick={onMouseClick}
      style={{ display: 'contents' }}
    >
      {children}
    </div>
  )
}