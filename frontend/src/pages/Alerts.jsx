import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const MOCK_ALERTS = [
  { id: 1,  level: 'danger', title: 'Fraud Attempt Detected',         msg: 'TX-9919: ₹92,000 to unknown offshore account. Behavioral signature does not match registered user profile.',             time: '09:55:12', txId: 'TX-9919', dismissed: false },
  { id: 2,  level: 'danger', title: 'Bot Signature Identified',        msg: 'Mouse movement entropy exceeded threshold (92/100). Possible automated script detected on login form.',                   time: '09:54:40', dismissed: false },
  { id: 3,  level: 'warn',   title: 'Unusual Tab-Switch Pattern',      msg: 'User switched browser tabs 14 times in 30 seconds during transaction flow. Possible social-engineering in progress.',     time: '09:53:18', dismissed: false },
  { id: 4,  level: 'warn',   title: 'Geo-Velocity Anomaly',            msg: 'Login from Dubai (UAE) while registered device last seen in New Delhi (IN). Distance: 2,200 km in under 1 hour.',         time: '09:48:00', dismissed: false },
  { id: 5,  level: 'warn',   title: 'Multiple Failed PIN Entries',     msg: '4 failed PIN attempts within 60 seconds on account NS-4421. Account temporarily soft-locked.',                           time: '08:30:55', dismissed: false },
  { id: 6,  level: 'info',   title: 'New Device Fingerprint',          msg: 'Session initiated from a new device (Chrome 122 / Windows 11). 2FA challenge issued and passed.',                         time: '08:00:10', dismissed: true  },
  { id: 7,  level: 'info',   title: 'Password Reset Requested',        msg: 'Password reset link sent to registered email. Request originated from known IP (182.xx.xx.xx).',                          time: '07:45:00', dismissed: true  },
  { id: 8,  level: 'danger', title: 'Crypto Transaction Blocked',      msg: 'TX-9917: ₹50,000 to unregistered crypto gateway. Flagged by AI risk engine. Risk score: 88/100.',                         time: 'Yesterday', txId: 'TX-9917', dismissed: false },
]

const LEVEL_CFG = {
  danger: { color: '#ff2d55', bg: 'rgba(255,45,85,0.1)',  border: 'rgba(255,45,85,0.3)',  icon: '⛔', label: 'CRITICAL' },
  warn:   { color: '#ffe600', bg: 'rgba(255,230,0,0.08)', border: 'rgba(255,230,0,0.3)',  icon: '⚠',  label: 'WARNING'  },
  info:   { color: '#00f5ff', bg: 'rgba(0,245,255,0.06)', border: 'rgba(0,245,255,0.2)',  icon: '●',  label: 'INFO'     },
}

export default function Alerts() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  const [filter, setFilter] = useState('all') // all | active | danger | warn

  const dismiss  = (id) => setAlerts((a) => a.map((x) => x.id === id ? { ...x, dismissed: true } : x))
  const dismissAll = () => setAlerts((a) => a.map((x) => ({ ...x, dismissed: true })))

  const filtered = alerts.filter((a) => {
    if (filter === 'active')  return !a.dismissed
    if (filter === 'danger')  return a.level === 'danger'
    if (filter === 'warn')    return a.level === 'warn'
    return true
  })

  const activeCount = alerts.filter((a) => !a.dismissed).length

  return (
    <div style={{ minHeight: '100vh', background: '#020810', position: 'relative', overflow: 'hidden' }}>
      <div className="hex-bg" />
      <div className="scanline" />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '0 24px 48px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 0 14px', borderBottom: '1px solid rgba(0,245,255,0.1)', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#00b8c8', cursor: 'pointer', fontSize: 18 }}>←</button>
            <span style={{ fontSize: 22 }}>🚨</span>
            <span className="glitch neon-cyan" data-text="SECURITY ALERTS" style={{ fontSize: 16, fontWeight: 900, letterSpacing: 4 }}>
              SECURITY ALERTS
            </span>
            {activeCount > 0 && (
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="badge badge-red"
              >
                ● {activeCount} ACTIVE
              </motion.span>
            )}
          </div>
          <button
            onClick={dismissAll}
            style={{
              padding: '7px 16px', background: 'rgba(0,245,255,0.06)',
              border: '1px solid rgba(0,245,255,0.2)', borderRadius: 7,
              color: '#00b8c8', fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
            }}
          >
            DISMISS ALL
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'all',    label: `ALL (${alerts.length})` },
            { key: 'active', label: `ACTIVE (${activeCount})` },
            { key: 'danger', label: `CRITICAL (${alerts.filter(a=>a.level==='danger').length})` },
            { key: 'warn',   label: `WARNINGS (${alerts.filter(a=>a.level==='warn').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '7px 16px', borderRadius: 7, fontSize: 10, fontWeight: 700,
                letterSpacing: 2, cursor: 'pointer', border: '1px solid',
                background: filter === tab.key ? 'rgba(0,245,255,0.12)' : 'transparent',
                borderColor: filter === tab.key ? 'rgba(0,245,255,0.4)' : 'rgba(0,245,255,0.12)',
                color: filter === tab.key ? '#00f5ff' : 'rgba(255,255,255,0.35)',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Alert cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {filtered.map((alert) => {
              const cfg = LEVEL_CFG[alert.level]
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: alert.dismissed ? 0.35 : 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="panel"
                  style={{
                    padding: '18px 22px', borderColor: cfg.border,
                    background: alert.dismissed ? 'rgba(6,18,38,0.4)' : cfg.bg,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color, letterSpacing: 1 }}>
                          {alert.title}
                        </span>
                        <span style={{
                          fontSize: 9, padding: '2px 7px', borderRadius: 3,
                          background: `${cfg.color}22`, border: `1px solid ${cfg.color}44`,
                          color: cfg.color, letterSpacing: 2, fontWeight: 700,
                        }}>
                          {cfg.label}
                        </span>
                        {alert.dismissed && (
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>
                            DISMISSED
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 10 }}>
                        {alert.msg}
                      </p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                        <span>🕐 {alert.time}</span>
                        {alert.txId && <span style={{ color: '#00f5ff' }}>🔗 {alert.txId}</span>}
                      </div>
                    </div>

                    {!alert.dismissed && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={() => dismiss(alert.id)}
                          style={{
                            padding: '6px 16px', background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
                            color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700,
                            letterSpacing: 2, cursor: 'pointer',
                          }}
                        >DISMISS</button>
                        {alert.level === 'danger' && (
                          <button style={{
                            padding: '6px 16px', background: 'rgba(255,45,85,0.2)',
                            border: '1px solid rgba(255,45,85,0.4)', borderRadius: 6,
                            color: '#ff2d55', fontSize: 10, fontWeight: 700,
                            letterSpacing: 2, cursor: 'pointer',
                          }}>ESCALATE</button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)', fontSize: 12, letterSpacing: 3 }}>
              ✓ NO ALERTS IN THIS CATEGORY
            </div>
          )}
        </div>
      </div>
    </div>
  )
}