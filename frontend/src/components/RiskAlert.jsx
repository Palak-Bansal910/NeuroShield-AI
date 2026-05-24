import { motion, AnimatePresence } from 'framer-motion'

/**
 * RiskAlert — fullscreen fraud/warning modal
 * Props:
 *   visible   boolean
 *   level     'danger' | 'warn'
 *   title     string
 *   message   string
 *   txId      string  (optional)
 *   onDismiss function
 *   onBlock   function (optional — show "Block Transaction" button)
 */
export default function RiskAlert({ visible, level = 'danger', title, message, txId, onDismiss, onBlock }) {
  const isDanger = level === 'danger'
  const accent   = isDanger ? '#ff2d55' : '#ffe600'
  const icon     = isDanger ? '⛔' : '⚠️'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', width: 400, height: 400, borderRadius: '50%',
            background: accent, opacity: 0.06, filter: 'blur(80px)', pointerEvents: 'none',
          }} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            style={{
              width: 440, background: 'rgba(8,5,18,0.97)',
              border: `1.5px solid ${accent}`,
              borderRadius: 18, padding: '40px 44px',
              textAlign: 'center',
              boxShadow: `0 0 60px ${accent}44, inset 0 0 40px ${accent}08`,
              zIndex: 1,
            }}
          >
            {/* Pulsing icon */}
            <motion.div
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 52, marginBottom: 16, display: 'inline-block' }}
            >
              {icon}
            </motion.div>

            {/* Title */}
            <div style={{
              fontSize: 20, fontWeight: 900, letterSpacing: 4,
              color: accent, marginBottom: 8,
              textShadow: `0 0 20px ${accent}`,
            }}>
              {title || (isDanger ? 'FRAUD DETECTED' : 'SUSPICIOUS ACTIVITY')}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: `${accent}33`, margin: '14px 0' }} />

            {/* Message */}
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.8, marginBottom: 20,
            }}>
              {message || 'Anomalous behavioral signature identified. Immediate action required.'}
            </p>

            {/* Tx badge */}
            {txId && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', background: `${accent}15`,
                border: `1px solid ${accent}40`, borderRadius: 8,
                fontSize: 12, color: accent, fontWeight: 700,
                letterSpacing: 1, marginBottom: 24,
              }}>
                🔒 Transaction {txId} — BLOCKED
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {onBlock && (
                <button
                  onClick={onBlock}
                  style={{
                    padding: '10px 28px', background: accent,
                    border: 'none', borderRadius: 8, color: '#000',
                    fontSize: 12, fontWeight: 900, letterSpacing: 2, cursor: 'pointer',
                  }}
                >
                  BLOCK NOW
                </button>
              )}
              <button
                onClick={onDismiss}
                style={{
                  padding: '10px 28px',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid rgba(255,255,255,0.15)`,
                  borderRadius: 8, color: 'rgba(255,255,255,0.7)',
                  fontSize: 12, fontWeight: 700, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                ACKNOWLEDGE
              </button>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 20, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>
              NEUROSHIELD AI ENGINE · REAL-TIME DETECTION
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}