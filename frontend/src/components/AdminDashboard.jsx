import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'

const rand = (min, max) => Math.random() * (max - min) + min
const genPoints = (n = 20, base = 20, v = 12) =>
  Array.from({ length: n }, (_, i) => ({
    t: i,
    v: Math.max(0, Math.min(100, base + Math.sin(i * 0.7) * v + rand(-4, 4))),
  }))

const STATS = [
  { label: 'Threats Blocked',  value: '1,249', delta: -12, color: '#00ff9d', points: genPoints(20, 25, 8)  },
  { label: 'Sessions Today',   value: '3',     delta: 0,   color: '#00f5ff', points: genPoints(20, 10, 4)  },
  { label: 'Tx Monitored',     value: '127',   delta: -3,  color: '#00b8c8', points: genPoints(20, 30, 10) },
  { label: 'Avg Response',     value: '4ms',   delta: -8,  color: '#7b2ff7', points: genPoints(20, 5,  2)  },
]

/**
 * AdminDashboard
 * Props:
 *   riskScore number  0–100  (live, from context)
 *   riskPoints Array  for the risk sparkline
 */
export default function AdminDashboard({ riskScore = 18, riskPoints }) {
  const pts = riskPoints || genPoints(20, riskScore, 10)
  const riskColor = riskScore > 75 ? '#ff2d55' : riskScore > 50 ? '#ff9500' : riskScore > 25 ? '#ffe600' : '#00ff9d'

  const cards = [
    ...STATS.slice(0, 1),
    { label: 'Risk Score', value: `${riskScore}`, delta: riskScore > 50 ? 30 : -5, color: riskColor, points: pts },
    ...STATS.slice(1),
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 14,
    }}>
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="panel"
          style={{ padding: '16px 18px' }}
        >
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: 8 }}>
            {c.label.toUpperCase()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{
              fontSize: 28, fontWeight: 800, color: c.color,
              fontFamily: "'Courier New', monospace",
              textShadow: `0 0 14px ${c.color}88`,
            }}>
              {c.value}
            </span>
            <div style={{ width: 80, height: 36 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={c.points} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                  <defs>
                    <linearGradient id={`g-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={c.color} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={c.color} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone" dataKey="v"
                    stroke={c.color} strokeWidth={1.6}
                    fill={`url(#g-${i})`} dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{
            marginTop: 8, fontSize: 10,
            color: c.delta < 0 ? '#00ff9d' : '#ff2d55',
          }}>
            {c.delta < 0 ? '▼' : '▲'} {Math.abs(c.delta)}% vs last session
          </div>
        </motion.div>
      ))}
    </div>
  )
}