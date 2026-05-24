import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useKeystrokeTracker } from '../hooks/useKeystrokeTracker'

/**
 * LoginSimulator
 * Props:
 *   onSuccess(userData)  callback on successful login
 *   onBehaviorData(data) optional — receive live behavioral metrics
 */
export default function LoginSimulator({ onSuccess, onBehaviorData }) {
  const [userId,  setUserId]  = useState('')
  const [pass,    setPass]    = useState('')
  const [phase,   setPhase]   = useState('idle')  // idle | loading | error
  const [errMsg,  setErrMsg]  = useState('')
  const { data: ks, onKeyDown, onKeyUp } = useKeystrokeTracker()

  const handleKey = (e) => {
    onKeyDown(e)
    onBehaviorData?.({ ...ks })
  }

  const handleSubmit = async () => {
    if (!userId.trim() || !pass.trim()) {
      setErrMsg('USER ID and ACCESS KEY are required.')
      setPhase('error')
      return
    }
    setPhase('loading')
    setErrMsg('')

    // Simulate auth delay (replace with real API call)
    await new Promise((r) => setTimeout(r, 2000))

    // Demo: any credentials work
    onSuccess?.({
      userId: userId.trim(),
      sessionId: `SES-${Date.now()}`,
      keystrokeProfile: ks,
    })
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)',
    color: 'white', fontSize: 13, fontFamily: "'Courier New', monospace",
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* User ID */}
      <div>
        <label style={{ fontSize: 10, color: '#00b8c8', letterSpacing: 3, display: 'block', marginBottom: 6 }}>
          USER ID
        </label>
        <input
          type="text"
          value={userId}
          placeholder="user@neuroshield.ai"
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={handleKey}
          onKeyUp={onKeyUp}
          style={inputStyle}
        />
      </div>

      {/* Password */}
      <div>
        <label style={{ fontSize: 10, color: '#00b8c8', letterSpacing: 3, display: 'block', marginBottom: 6 }}>
          ACCESS KEY
        </label>
        <input
          type="password"
          value={pass}
          placeholder="••••••••"
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={handleKey}
          onKeyUp={onKeyUp}
          style={inputStyle}
        />
      </div>

      {/* Live biometrics strip */}
      <div style={{
        padding: '10px 14px', borderRadius: 8,
        background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.12)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11,
      }}>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>
          ⌨ Avg interval
          <span style={{ color: '#00f5ff', marginLeft: 6 }}>
            {ks.avgInterval ? `${ks.avgInterval}ms` : '—'}
          </span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>
          ⚡ Keys pressed
          <span style={{ color: '#00f5ff', marginLeft: 6 }}>{ks.totalKeys}</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>
          📊 Variance
          <span style={{ color: ks.variance > 150 ? '#ff9500' : '#00ff9d', marginLeft: 6 }}>
            {ks.variance != null ? `${ks.variance}ms` : '—'}
          </span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>
          🎯 Rhythm
          <span style={{
            marginLeft: 6,
            color: ks.anomalyScore > 50 ? '#ff2d55' : ks.anomalyScore > 25 ? '#ff9500' : '#00ff9d',
          }}>
            {ks.totalKeys < 4 ? 'LEARNING…' : ks.anomalyScore > 50 ? 'ANOMALOUS' : 'NORMAL'}
          </span>
        </div>
      </div>

      {/* Error */}
      {phase === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 12, color: '#ff2d55', padding: '8px 12px', background: 'rgba(255,45,85,0.1)', borderRadius: 6, border: '1px solid rgba(255,45,85,0.3)' }}
        >
          ✖ {errMsg}
        </motion.div>
      )}

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        onClick={handleSubmit}
        disabled={phase === 'loading'}
        style={{
          width: '100%', padding: '13px', borderRadius: 10, border: 'none',
          background: phase === 'loading'
            ? 'rgba(0,245,255,0.12)'
            : 'linear-gradient(90deg, #00f5ffcc, #2563eb)',
          color: 'white', fontSize: 13, fontWeight: 800,
          letterSpacing: 3, cursor: phase === 'loading' ? 'default' : 'pointer',
          fontFamily: "'Courier New', monospace",
        }}
      >
        {phase === 'loading' ? (
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
            AUTHENTICATING…
          </motion.span>
        ) : 'SECURE LOGIN →'}
      </motion.button>
    </div>
  )
}