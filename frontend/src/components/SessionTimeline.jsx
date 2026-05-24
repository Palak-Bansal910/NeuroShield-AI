import { motion, AnimatePresence } from 'framer-motion'

const LEVEL_CONFIG = {
  danger: { color: '#ff2d55', bg: 'rgba(255,45,85,0.1)',  border: 'rgba(255,45,85,0.35)',  icon: '✖', label: 'THREAT' },
  warn:   { color: '#ffe600', bg: 'rgba(255,230,0,0.08)', border: 'rgba(255,230,0,0.3)',   icon: '⚠', label: 'WARN' },
  info:   { color: '#00f5ff', bg: 'rgba(0,245,255,0.05)', border: 'rgba(0,245,255,0.15)',  icon: '●', label: 'INFO' },
  ok:     { color: '#00ff9d', bg: 'rgba(0,255,157,0.05)', border: 'rgba(0,255,157,0.2)',   icon: '✓', label: 'OK' },
}

/**
 * SessionTimeline
 * Props:
 *   events  Array<{ id, level, msg, time }>
 *   title   string
 *   maxH    string (max-height CSS, default '420px')
 */
export default function SessionTimeline({ events = [], title = 'LIVE THREAT LOG', maxH = '420px' }) {
  return (
    <div className="panel" style={{ padding: '18px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 3 }}>{title}</span>
        <span style={{ fontSize: 10, color: '#00ff9d', letterSpacing: 2 }}>
          ● {events.length} EVENTS
        </span>
      </div>

      {/* Event list */}
      <div style={{ overflowY: 'auto', maxHeight: maxH, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {events.length === 0 && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '20px 0', letterSpacing: 2 }}>
              MONITORING…
            </div>
          )}
          {events.map((ev) => {
            const cfg = LEVEL_CONFIG[ev.level] || LEVEL_CONFIG.info
            return (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{
                  padding: '9px 12px', borderRadius: 8, fontSize: 11, lineHeight: 1.55,
                  background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <span>
                    <span style={{ opacity: 0.6, marginRight: 5 }}>{cfg.icon}</span>
                    {ev.msg}
                  </span>
                  <span style={{ fontSize: 9, opacity: 0.45, whiteSpace: 'nowrap', marginTop: 1 }}>
                    {ev.time}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,245,255,0.08)',
        display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.25)',
        letterSpacing: 1,
      }}>
        <span>BehaviorNet v3.2</span>
        <span>LATENCY 4ms</span>
        <span>1,240 sig/s</span>
      </div>
    </div>
  )
}