import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import TrustScoreCard from '../components/TrustScoreCard'

const rand = (a, b) => Math.random() * (b - a) + a

const RADAR_DATA = [
  { axis: 'Keystroke',   A: 82, B: 30 },
  { axis: 'Mouse',       A: 65, B: 85 },
  { axis: 'Session',     A: 90, B: 20 },
  { axis: 'Geo',         A: 95, B: 10 },
  { axis: 'Device',      A: 88, B: 45 },
  { axis: 'Paste',       A: 70, B: 90 },
]

const THREAT_CATS = [
  { name: 'Phishing',            count: 142, color: '#ff2d55' },
  { name: 'Account Takeover',    count: 98,  color: '#ff9500' },
  { name: 'Synthetic ID',        count: 76,  color: '#ffe600' },
  { name: 'Card Skimming',       count: 52,  color: '#7b2ff7' },
  { name: 'Credential Stuffing', count: 36,  color: '#00f5ff' },
]

const genTrend = (n = 14) =>
  Array.from({ length: n }, (_, i) => ({
    day: `D-${n - i}`,
    threats: Math.round(rand(20, 80)),
    blocked: Math.round(rand(15, 75)),
  }))

const SIGNALS = [
  { label: 'Keystroke Anomaly',   score: 14, threshold: 40 },
  { label: 'Mouse Entropy',       score: 68, threshold: 60 },
  { label: 'Session Risk',        score: 22, threshold: 50 },
  { label: 'Geo Velocity',        score: 5,  threshold: 70 },
  { label: 'Paste Frequency',     score: 55, threshold: 45 },
  { label: 'Device Trust',        score: 88, threshold: 30 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0a1628', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 11 }}>
      <div style={{ color: '#00f5ff', marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function RiskAnalysis() {
  const navigate = useNavigate()
  const [trend]  = useState(genTrend())
  const [scores, setScores] = useState(SIGNALS)

  // Animate scores on mount
  useEffect(() => {
    const id = setInterval(() => {
      setScores((prev) => prev.map((s) => ({
        ...s,
        score: Math.max(0, Math.min(100, s.score + rand(-3, 3))),
      })))
    }, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#020810', position: 'relative', overflow: 'hidden' }}>
      <div className="hex-bg" />
      <div className="scanline" />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1360, margin: '0 auto', padding: '0 24px 48px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 0 14px', borderBottom: '1px solid rgba(0,245,255,0.1)', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#00b8c8', cursor: 'pointer', fontSize: 18 }}>←</button>
            <span style={{ fontSize: 24 }}>🛡️</span>
            <span className="glitch neon-cyan" data-text="THREAT ANALYSIS" style={{ fontSize: 16, fontWeight: 900, letterSpacing: 4 }}>
              THREAT ANALYSIS
            </span>
            <span className="badge badge-red">● 2 ACTIVE</span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>
            SESSION · {new Date().toLocaleTimeString()}
          </span>
        </div>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: 16, marginBottom: 16 }}>

          {/* Radar chart */}
          <div className="panel" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 3, marginBottom: 14 }}>
              BEHAVIORAL PROFILE — USER vs ANOMALY
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(0,245,255,0.1)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} />
                <Radar name="Normal" dataKey="A" stroke="#00ff9d" fill="#00ff9d" fillOpacity={0.15} strokeWidth={1.5} />
                <Radar name="Current" dataKey="B" stroke="#ff2d55" fill="#ff2d55" fillOpacity={0.12} strokeWidth={1.5} />
                <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Threat categories */}
          <div className="panel" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 3, marginBottom: 14 }}>
              THREAT CATEGORIES · 30 DAYS
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={THREAT_CATS} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {THREAT_CATS.map((entry, i) => (
                    <rect key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Trust score */}
          <div className="panel" style={{ padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 3 }}>CURRENT TRUST</span>
            <TrustScoreCard score={82} size={130} />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.7 }}>
              2 signals above threshold
            </div>
          </div>
        </div>

        {/* Signal meters */}
        <div className="panel" style={{ padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 3, marginBottom: 16 }}>
            LIVE BEHAVIORAL SIGNAL METERS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {scores.map((sig) => {
              const isHigh = sig.score > sig.threshold
              const color  = isHigh ? '#ff2d55' : '#00ff9d'
              return (
                <div key={sig.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{sig.label}</span>
                    <span style={{ color, fontFamily: "'Courier New', monospace", fontWeight: 700 }}>
                      {Math.round(sig.score)}
                      {isHigh && <span style={{ marginLeft: 4, fontSize: 9 }}>⚠ ABOVE THRESHOLD</span>}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                    <motion.div
                      animate={{ width: `${sig.score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ height: '100%', background: color, borderRadius: 3, boxShadow: `0 0 8px ${color}88` }}
                    />
                    {/* Threshold line */}
                    <div style={{
                      position: 'absolute', top: 0, bottom: 0, left: `${sig.threshold}%`,
                      width: 1.5, background: '#ffe600', opacity: 0.7,
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Trend chart */}
        <div className="panel" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 3, marginBottom: 14 }}>
            THREAT TREND · LAST 14 DAYS
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }} />
              <Line type="monotone" dataKey="threats" stroke="#ff2d55" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="blocked" stroke="#00ff9d" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}