import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ── helpers ──────────────────────────────────────────────────────────
const rand = (a, b) => Math.random() * (b - a) + a;
const genPts = (n = 30, base = 18, v = 8) =>
  Array.from({ length: n }, (_, i) => ({
    t: i,
    risk: Math.max(0, Math.min(100, base + Math.sin(i * 0.6) * v + rand(-4, 4))),
  }));

const riskColor = (trust) =>
  trust > 75 ? "#00ff9d" : trust > 50 ? "#ffe600" : trust > 30 ? "#ff9500" : "#ff2d55";

// ── Trust Meter ───────────────────────────────────────────────────────
function TrustMeter({ score }) {
  const r = 54, cx = 70, cy = 70, circ = 2 * Math.PI * r;
  const color = riskColor(score);
  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <motion.circle
          cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ transformOrigin: "center", transform: "rotate(-90deg)", filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <circle cx={cx} cy={cy} r={r - 14} fill="rgba(2,8,16,0.9)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <motion.span key={score} animate={{ opacity: [0, 1] }}
          style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "'Courier New',monospace", lineHeight: 1, textShadow: `0 0 16px ${color}` }}>
          {score}
        </motion.span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>TRUST</span>
      </div>
    </div>
  );
}

// ── Fraud Alert Modal ─────────────────────────────────────────────────
function FraudModal({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ width: 420, background: "rgba(8,5,18,0.98)", border: "1.5px solid #ff2d55", borderRadius: 18, padding: "40px 44px", textAlign: "center", boxShadow: "0 0 60px rgba(255,45,85,0.4)" }}
      >
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ fontSize: 50, marginBottom: 14 }}>⛔</motion.div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#ff2d55", letterSpacing: 4, marginBottom: 8, textShadow: "0 0 20px #ff2d55" }}>FRAUD DETECTED</div>
        <div style={{ height: 1, background: "rgba(255,45,85,0.3)", margin: "14px 0" }} />
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 24 }}>
          Anomalous behavioral signature identified.<br />
          Transaction <strong style={{ color: "white" }}>TX-9919</strong> has been blocked.<br />
          Trust score dropped to <strong style={{ color: "#ff2d55" }}>18/100</strong>.
        </p>
        <button onClick={onDismiss} style={{ padding: "10px 32px", background: "#ff2d55", border: "none", borderRadius: 8, color: "white", fontSize: 12, fontWeight: 900, letterSpacing: 2, cursor: "pointer" }}>
          ACKNOWLEDGE
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────
const INIT_EVENTS = [
  { id: 1, level: "ok",   msg: "Login from New Delhi — device fingerprint matched", time: "09:41:22" },
  { id: 2, level: "ok",   msg: "Keystroke velocity nominal (avg 142ms)",            time: "09:41:23" },
  { id: 3, level: "ok",   msg: "Geo-velocity check passed",                         time: "09:41:24" },
];
const FRAUD_STEPS = [
  { ms: 600,  trust: 65, ev: { id: 10, level: "warn",   msg: "Unusual tab-switch pattern detected" } },
  { ms: 1400, trust: 41, ev: { id: 11, level: "warn",   msg: "Multiple failed PIN entries in 60s"  } },
  { ms: 2400, trust: 18, ev: { id: 12, level: "danger", msg: "Mouse entropy HIGH — bot signature"  } },
  { ms: 3200, trust: 18, ev: { id: 13, level: "danger", msg: "TX-9919 blocked — risk score 96/100" }, showAlert: true },
];
const SIGNALS = [
  { label: "Typing rhythm",      ok: true  },
  { label: "Device fingerprint", ok: true  },
  { label: "Mouse entropy",      ok: false },
  { label: "Session duration",   ok: true  },
  { label: "Geo-velocity",       ok: true  },
  { label: "Copy-paste ratio",   ok: false },
  { label: "Navigation pattern", ok: true  },
];
const TXS = [
  { id: "TX-9921", merchant: "Amazon India",     amount: "₹4,299",  risk: 12, blocked: false },
  { id: "TX-9920", merchant: "Swiggy",           amount: "₹389",    risk: 8,  blocked: false },
  { id: "TX-9919", merchant: "Unknown Offshore", amount: "₹92,000", risk: 96, blocked: true  },
  { id: "TX-9918", merchant: "Flipkart",         amount: "₹1,199",  risk: 5,  blocked: false },
  { id: "TX-9917", merchant: "Crypto Gateway",   amount: "₹50,000", risk: 88, blocked: true  },
];

const LEVEL_CFG = {
  ok:     { color: "#00ff9d", icon: "✓" },
  warn:   { color: "#ffe600", icon: "⚠" },
  danger: { color: "#ff2d55", icon: "✖" },
};

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [trust,      setTrust]      = useState(82);
  const [riskPts,    setRiskPts]    = useState(() => genPts());
  const [events,     setEvents]     = useState(INIT_EVENTS);
  const [simulating, setSimulating] = useState(false);
  const [showAlert,  setShowAlert]  = useState(false);
  const [tick,       setTick]       = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setRiskPts((p) => {
      const last = p[p.length - 1];
      return [...p.slice(1), {
        t:    last.t + 1,
        risk: Math.max(0, Math.min(100, simulating ? rand(60, 95) : rand(8, 28))),
      }];
    });
  }, [tick]);

  const addEvent = (ev) => {
    const time = new Date().toLocaleTimeString();
    setEvents((prev) => [{ ...ev, time }, ...prev].slice(0, 20));
  };

  const simulateFraud = () => {
    if (simulating) return;
    setSimulating(true);
    FRAUD_STEPS.forEach(({ ms, trust: t, ev, showAlert: sa }) => {
      setTimeout(() => {
        setTrust(t);
        addEvent(ev);
        if (sa) setShowAlert(true);
      }, ms);
    });
  };

  const reset = useCallback(() => {
    setTrust(82);
    setSimulating(false);
    setShowAlert(false);
    setEvents(INIT_EVENTS);
    setRiskPts(genPts());
  }, []);

  const rc = riskColor(trust);

  return (
    <div style={{ minHeight: "100vh", background: "#020810", position: "relative", overflow: "hidden", fontFamily: "'Courier New',monospace" }}>
      <div className="hex-bg" />
      <div className="scanline" />

      <AnimatePresence>{showAlert && <FraudModal onDismiss={() => { setShowAlert(false); reset(); }} />}</AnimatePresence>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1360, margin: "0 auto", padding: "0 20px 48px" }}>

        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0 14px", borderBottom: "1px solid rgba(0,245,255,0.1)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#00f5ff", letterSpacing: 5, textShadow: "0 0 16px #00f5ff" }}>NEUROSHIELD</span>
            <span style={{ fontSize: 10, color: "#00ff9d", border: "1px solid rgba(0,255,157,0.3)", padding: "2px 8px", borderRadius: 4, letterSpacing: 2 }}>● LIVE</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["TRANSACTIONS", "/transactions"], ["THREAT ANALYSIS", "/risk-analysis"], ["ALERTS", "/alerts"]].map(([label, path]) => (
              <button key={label} onClick={() => navigate(path)} style={{ padding: "7px 14px", background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 7, color: "#00b8c8", fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>
                {label}
              </button>
            ))}
            <button onClick={simulateFraud} disabled={simulating} style={{ padding: "7px 18px", background: simulating ? "rgba(255,45,85,0.18)" : "rgba(255,45,85,0.1)", border: "1px solid rgba(255,45,85,0.4)", borderRadius: 7, color: "#ff2d55", fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: simulating ? "default" : "pointer" }}>
              {simulating ? "⚡ SIMULATING…" : "⚡ SIMULATE FRAUD"}
            </button>
            <button onClick={reset} style={{ padding: "7px 14px", background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.15)", borderRadius: 7, color: "#00f5ff", fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: "pointer" }}>↺ RESET</button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Threats Blocked", value: "1,249", color: "#00ff9d", delta: "▼ 12%" },
            { label: "Risk Score",      value: `${100 - trust}`, color: rc, delta: simulating ? "▲ 47%" : "▼ 5%" },
            { label: "Sessions Today",  value: "3",     color: "#00f5ff", delta: "— 0%"  },
            { label: "Tx Monitored",    value: "127",   color: "#00b8c8", delta: "▼ 3%"  },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(6,18,38,0.88)", border: "1px solid rgba(0,245,255,0.13)", borderRadius: 12, padding: "14px 18px", backdropFilter: "blur(14px)" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, textShadow: `0 0 14px ${s.color}88` }}>{s.value}</div>
              <div style={{ fontSize: 10, marginTop: 6, color: s.delta.startsWith("▲") ? "#ff2d55" : "#00ff9d" }}>{s.delta} vs last session</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "210px 1fr 260px", gap: 16 }}>

          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "rgba(6,18,38,0.88)", border: "1px solid rgba(0,245,255,0.13)", borderRadius: 14, padding: "20px 16px", backdropFilter: "blur(14px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3 }}>TRUST SCORE</span>
              <TrustMeter score={trust} />
              <div style={{ width: "100%", padding: "7px 10px", background: `${rc}14`, border: `1px solid ${rc}44`, borderRadius: 8, textAlign: "center", fontSize: 11, color: rc, fontWeight: 700, letterSpacing: 2 }}>
                {trust > 75 ? "✓ LOW RISK" : trust > 50 ? "⚠ MEDIUM RISK" : "✖ HIGH RISK"}
              </div>
            </div>

            <div style={{ background: "rgba(6,18,38,0.88)", border: "1px solid rgba(0,245,255,0.13)", borderRadius: 14, padding: "16px", backdropFilter: "blur(14px)" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3, marginBottom: 12 }}>AI BEHAVIORAL ANALYSIS</div>
              {SIGNALS.map((sig) => {
                const flagged = !sig.ok && simulating;
                return (
                  <div key={sig.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{sig.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: flagged ? "#ff2d55" : sig.ok ? "#00ff9d" : "#ff9500" }}>
                      {flagged ? "ANOMALY" : sig.ok ? "NORMAL" : "ELEVATED"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Centre */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Risk graph */}
            <div style={{ background: "rgba(6,18,38,0.88)", border: "1px solid rgba(0,245,255,0.13)", borderRadius: 14, padding: "20px 22px", backdropFilter: "blur(14px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 3 }}>LIVE RISK · 30 SIGNALS</span>
                <span style={{ fontSize: 11, color: rc }}>RISK {100 - trust}</span>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={riskPts} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={rc} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={rc} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="t" hide />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)" }} />
                  <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 6, fontSize: 11 }} />
                  <Area type="monotone" dataKey="risk" stroke={rc} strokeWidth={2} fill="url(#rg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Transactions */}
            <div style={{ background: "rgba(6,18,38,0.88)", border: "1px solid rgba(0,245,255,0.13)", borderRadius: 14, padding: "18px 20px", flex: 1, backdropFilter: "blur(14px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 3 }}>RECENT TRANSACTIONS</span>
                <button onClick={() => navigate("/transactions")} style={{ fontSize: 10, color: "#00b8c8", background: "none", border: "none", cursor: "pointer" }}>VIEW ALL →</button>
              </div>
              {TXS.map((tx, i) => {
                const tc = tx.risk > 70 ? "#ff2d55" : tx.risk > 40 ? "#ff9500" : "#00ff9d";
                return (
                  <motion.div key={tx.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    style={{ display: "grid", gridTemplateColumns: "80px 1fr 90px 60px 80px", gap: "6px 10px", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", background: tx.blocked && simulating ? "rgba(255,45,85,0.05)" : "transparent" }}>
                    <span style={{ fontSize: 11, color: "#00f5ff" }}>{tx.id}</span>
                    <span style={{ fontSize: 11, color: tx.blocked && simulating ? "#ff2d55" : "rgba(255,255,255,0.7)" }}>{tx.merchant}</span>
                    <span style={{ fontSize: 11, color: "white" }}>{tx.amount}</span>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${tx.risk}%`, background: tc, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, color: tx.blocked ? "#ff2d55" : "#00ff9d" }}>
                      {tx.blocked ? "✖ BLOCKED" : "✓ OK"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right — event log */}
          <div style={{ background: "rgba(6,18,38,0.88)", border: "1px solid rgba(0,245,255,0.13)", borderRadius: 14, padding: "18px 16px", backdropFilter: "blur(14px)", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 3, marginBottom: 14 }}>LIVE THREAT LOG</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, overflowY: "auto" }}>
              <AnimatePresence mode="popLayout">
                {events.map((ev) => {
                  const cfg = LEVEL_CFG[ev.level] || LEVEL_CFG.ok;
                  return (
                    <motion.div key={ev.id + ev.msg}
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ padding: "9px 11px", borderRadius: 8, fontSize: 11, lineHeight: 1.5,
                        background: ev.level === "danger" ? "rgba(255,45,85,0.1)" : ev.level === "warn" ? "rgba(255,230,0,0.08)" : "rgba(0,245,255,0.05)",
                        border: `1px solid ${cfg.color}44`, color: cfg.color }}>
                      <span style={{ opacity: 0.6, marginRight: 5 }}>{cfg.icon}</span>{ev.msg}
                      <div style={{ fontSize: 9, opacity: 0.4, marginTop: 3 }}>{ev.time}</div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {/* Footer */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,245,255,0.08)", display: "flex", flexDirection: "column", gap: 6 }}>
              {[["Model", "BehaviorNet v3.2"], ["Signals/sec", "1,240"], ["Latency", "4ms"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>{k}</span>
                  <span style={{ color: "#00f5ff" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}