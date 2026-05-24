import { motion, AnimatePresence } from 'framer-motion'

const scoreColor = (s) =>
  s > 75 ? '#00ff9d' : s > 50 ? '#ffe600' : s > 30 ? '#ff9500' : '#ff2d55'

const scoreLabel = (s) =>
  s > 75 ? 'LOW RISK' : s > 50 ? 'MODERATE RISK' : s > 30 ? 'HIGH RISK' : 'CRITICAL'

const scoreIcon = (s) =>
  s > 75 ? '✓' : s > 50 ? '⚠' : '✖'

/**
 * TrustScoreCard
 * Props:
 *   score   number 0–100
 *   size    number  (default 160)
 *   label   string  (override label)
 *   compact boolean (smaller layout)
 */
export default function TrustScoreCard({ score = 82, size = 160, label, compact = false }) {
  const r       = size * 0.36
  const cx      = size / 2
  const cy      = size / 2
  const circ    = 2 * Math.PI * r
  const pct     = score / 100
  const color   = scoreColor(score)
  const stroke  = size * 0.07

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {/* Circle */}
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Pulse rings when critical */}
        {score <= 30 && (
          <>
            <div className="pulse-ring" style={{ animationDelay: '0s' }} />
            <div className="pulse-ring" style={{ animationDelay: '0.7s' }} />
          </>
        )}

        <svg width={size} height={size}>
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          {/* Glow backdrop arc */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke + 6}
            strokeDasharray={circ}
            strokeDashoffset={circ - pct * circ}
            strokeLinecap="round"
            opacity={0.08}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
          {/* Main arc */}
          <motion.circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - pct * circ }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
          {/* Inner bg */}
          <circle cx={cx} cy={cy} r={r - stroke - 4} fill="rgba(2,8,16,0.9)" />
        </svg>

        {/* Centre text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={score}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontSize: size * 0.19,
                fontWeight: 900,
                color,
                fontFamily: "'Courier New', monospace",
                lineHeight: 1,
                textShadow: `0 0 20px ${color}`,
              }}
            >
              {score}
            </motion.span>
          </AnimatePresence>
          <span style={{ fontSize: size * 0.07, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginTop: 2 }}>
            /100
          </span>
        </div>
      </div>

      {/* Label badge */}
      {!compact && (
        <motion.div
          key={scoreLabel(score)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '5px 16px',
            background: `${color}18`,
            border: `1px solid ${color}55`,
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            color,
            letterSpacing: 2,
          }}
        >
          {scoreIcon(score)} {label || scoreLabel(score)}
        </motion.div>
      )}
    </div>
  )
}