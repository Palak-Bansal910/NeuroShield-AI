import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const ALL_TX = [
  { id: 'TX-9921', merchant: 'Amazon India',      amount: 4299,   currency: '₹', time: '09:42', date: 'Today',     risk: 12, status: 'approved', category: 'Shopping',  location: 'New Delhi, IN'  },
  { id: 'TX-9920', merchant: 'Swiggy',             amount: 389,    currency: '₹', time: '08:17', date: 'Today',     risk: 8,  status: 'approved', category: 'Food',      location: 'New Delhi, IN'  },
  { id: 'TX-9919', merchant: 'Unknown Offshore',   amount: 92000,  currency: '₹', time: '07:55', date: 'Today',     risk: 96, status: 'blocked',  category: 'Transfer',  location: 'Unknown'        },
  { id: 'TX-9918', merchant: 'Flipkart',           amount: 1199,   currency: '₹', time: '22:10', date: 'Yesterday', risk: 5,  status: 'approved', category: 'Shopping',  location: 'Bengaluru, IN'  },
  { id: 'TX-9917', merchant: 'Crypto Gateway',     amount: 50000,  currency: '₹', time: '21:30', date: 'Yesterday', risk: 88, status: 'blocked',  category: 'Crypto',    location: 'Unknown'        },
  { id: 'TX-9916', merchant: 'Zomato',             amount: 540,    currency: '₹', time: '13:05', date: 'Yesterday', risk: 6,  status: 'approved', category: 'Food',      location: 'Mumbai, IN'     },
  { id: 'TX-9915', merchant: 'Netflix India',      amount: 649,    currency: '₹', time: '10:00', date: '2 days ago',risk: 3,  status: 'approved', category: 'Streaming', location: 'New Delhi, IN'  },
  { id: 'TX-9914', merchant: 'Foreign ATM',        amount: 15000,  currency: '₹', time: '03:22', date: '2 days ago',risk: 74, status: 'review',   category: 'ATM',       location: 'Dubai, UAE'     },
  { id: 'TX-9913', merchant: 'IRCTC',              amount: 2340,   currency: '₹', time: '11:45', date: '3 days ago',risk: 4,  status: 'approved', category: 'Travel',    location: 'New Delhi, IN'  },
  { id: 'TX-9912', merchant: 'Shell Petroleum',    amount: 3200,   currency: '₹', time: '08:00', date: '3 days ago',risk: 9,  status: 'approved', category: 'Fuel',      location: 'Gurugram, IN'   },
  { id: 'TX-9911', merchant: 'Binance P2P',        amount: 35000,  currency: '₹', time: '02:14', date: '4 days ago',risk: 91, status: 'blocked',  category: 'Crypto',    location: 'Unknown'        },
  { id: 'TX-9910', merchant: 'Ola Cabs',           amount: 280,    currency: '₹', time: '19:30', date: '4 days ago',risk: 7,  status: 'approved', category: 'Transport', location: 'Hyderabad, IN'  },
]

const riskColor  = (r) => r > 70 ? '#ff2d55' : r > 40 ? '#ff9500' : '#00ff9d'
const statusCfg  = {
  approved: { color: '#00ff9d', label: '✓ APPROVED' },
  blocked:  { color: '#ff2d55', label: '✖ BLOCKED'  },
  review:   { color: '#ffe600', label: '⚠ REVIEW'   },
}

export default function Transactions() {
  const navigate  = useNavigate()
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [sortBy,   setSortBy]   = useState('date') // date | risk | amount

  const filtered = useMemo(() => {
    let list = ALL_TX.filter((tx) => {
      const q = search.toLowerCase()
      return !q || tx.merchant.toLowerCase().includes(q) || tx.id.toLowerCase().includes(q)
    })
    if (filter === 'blocked')  list = list.filter((t) => t.status === 'blocked')
    if (filter === 'approved') list = list.filter((t) => t.status === 'approved')
    if (filter === 'risky')    list = list.filter((t) => t.risk > 60)
    if (sortBy === 'risk')     list = [...list].sort((a, b) => b.risk - a.risk)
    if (sortBy === 'amount')   list = [...list].sort((a, b) => b.amount - a.amount)
    return list
  }, [search, filter, sortBy])

  const totals = {
    blocked:  ALL_TX.filter((t) => t.status === 'blocked').length,
    total:    ALL_TX.length,
    risky:    ALL_TX.filter((t) => t.risk > 60).length,
    volume:   ALL_TX.reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN'),
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020810', position: 'relative', overflow: 'hidden' }}>
      <div className="hex-bg" />
      <div className="scanline" />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 24px 48px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 0 14px', borderBottom: '1px solid rgba(0,245,255,0.1)', marginBottom: 22,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#00b8c8', cursor: 'pointer', fontSize: 18 }}>←</button>
            <span style={{ fontSize: 22 }}>💳</span>
            <span className="glitch neon-cyan" data-text="TRANSACTION MONITOR" style={{ fontSize: 16, fontWeight: 900, letterSpacing: 4 }}>
              TRANSACTION MONITOR
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Transactions', value: totals.total,   color: '#00f5ff' },
            { label: 'Blocked',            value: totals.blocked, color: '#ff2d55' },
            { label: 'High Risk',          value: totals.risky,   color: '#ff9500' },
            { label: 'Total Volume',       value: `₹${totals.volume}`, color: '#00ff9d' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="panel"
              style={{ padding: '14px 16px' }}
            >
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'Courier New', monospace", textShadow: `0 0 12px ${s.color}88` }}>
                {s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchant or TX ID…"
            style={{
              flex: 1, minWidth: 200, padding: '9px 14px',
              background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)',
              borderRadius: 8, color: 'white', fontSize: 12,
              fontFamily: "'Courier New', monospace", outline: 'none',
            }}
          />

          {/* Filters */}
          {[
            { key: 'all',      label: 'ALL'      },
            { key: 'blocked',  label: 'BLOCKED'  },
            { key: 'approved', label: 'APPROVED' },
            { key: 'risky',    label: 'HIGH RISK'},
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '7px 14px', borderRadius: 7, fontSize: 10, fontWeight: 700,
                letterSpacing: 2, cursor: 'pointer', border: '1px solid',
                background: filter === f.key ? 'rgba(0,245,255,0.12)' : 'transparent',
                borderColor: filter === f.key ? 'rgba(0,245,255,0.4)' : 'rgba(0,245,255,0.12)',
                color: filter === f.key ? '#00f5ff' : 'rgba(255,255,255,0.35)',
              }}
            >{f.label}</button>
          ))}

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '7px 12px', background: 'rgba(6,18,38,0.9)',
              border: '1px solid rgba(0,245,255,0.15)', borderRadius: 7,
              color: '#00b8c8', fontSize: 10, fontFamily: "'Courier New', monospace",
              letterSpacing: 1, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="date">SORT: DATE</option>
            <option value="risk">SORT: RISK</option>
            <option value="amount">SORT: AMOUNT</option>
          </select>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '90px 1fr 100px 80px 100px 100px 44px',
          gap: '6px 12px', padding: '8px 16px',
          fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, marginBottom: 6,
        }}>
          <span>TX ID</span><span>MERCHANT</span><span>AMOUNT</span><span>TIME</span><span>STATUS</span><span>RISK</span><span></span>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <AnimatePresence>
            {filtered.map((tx, i) => {
              const sc  = statusCfg[tx.status]
              const rc  = riskColor(tx.risk)
              const isOpen = expanded === tx.id
              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="panel"
                  style={{
                    padding: '0',
                    borderColor: tx.status === 'blocked' ? 'rgba(255,45,85,0.25)' : 'rgba(0,245,255,0.1)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpanded(isOpen ? null : tx.id)}
                >
                  {/* Main row */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '90px 1fr 100px 80px 100px 100px 44px',
                    gap: '6px 12px', padding: '13px 16px', alignItems: 'center',
                    background: tx.status === 'blocked' ? 'rgba(255,45,85,0.04)' : 'transparent',
                  }}>
                    <span style={{ fontSize: 11, color: '#00f5ff', fontFamily: "'Courier New', monospace" }}>{tx.id}</span>
                    <span style={{ fontSize: 12, color: tx.status === 'blocked' ? '#ff2d55' : 'rgba(255,255,255,0.75)' }}>{tx.merchant}</span>
                    <span style={{ fontSize: 12, fontFamily: "'Courier New', monospace", color: 'white', fontWeight: 700 }}>
                      {tx.currency}{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{tx.date} {tx.time}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: sc.color }}>{sc.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${tx.risk}%`, background: rc, borderRadius: 2, boxShadow: `0 0 6px ${rc}77` }} />
                      </div>
                      <span style={{ fontSize: 10, color: rc, minWidth: 22, fontFamily: "'Courier New', monospace" }}>{tx.risk}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ borderTop: '1px solid rgba(0,245,255,0.08)', overflow: 'hidden' }}
                      >
                        <div style={{
                          padding: '14px 18px', display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, fontSize: 11,
                        }}>
                          {[
                            { label: 'Transaction ID', value: tx.id },
                            { label: 'Category',       value: tx.category },
                            { label: 'Location',       value: tx.location },
                            { label: 'Risk Score',     value: `${tx.risk}/100`, color: rc },
                          ].map((d) => (
                            <div key={d.label}>
                              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, marginBottom: 4 }}>{d.label}</div>
                              <div style={{ color: d.color || 'rgba(255,255,255,0.7)', fontFamily: "'Courier New', monospace" }}>{d.value}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)', fontSize: 12, letterSpacing: 3 }}>
              NO TRANSACTIONS MATCH YOUR FILTER
            </div>
          )}
        </div>

      </div>
    </div>
  )
}