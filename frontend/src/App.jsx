import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Palette & helpers ──────────────────────────────────────────────────────────
const C = {
  bg: "#020810",
  panel: "rgba(6,18,38,0.85)",
  cyan: "#00f5ff",
  cyanDim: "#00b8c8",
  red: "#ff2d55",
  green: "#00ff9d",
  yellow: "#ffe600",
  amber: "#ff9500",
  grid: "rgba(0,245,255,0.06)",
  border: "rgba(0,245,255,0.15)",
};

const rand = (min, max) => Math.random() * (max - min) + min;

// ── Sparkline data ─────────────────────────────────────────────────────────────
const genPoints = (n = 24, base = 20, variance = 15) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    y: base + Math.sin(i * 0.7) * variance + rand(-5, 5),
  }));

function Sparkline({ points, color, height = 48, width = 160, filled = false }) {
  if (!points.length) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minY = Math.min(...ys) - 2;
  const maxY = Math.max(...ys) + 2;
  const toSVG = (x, y) => [
    ((x - xs[0]) / (xs[xs.length - 1] - xs[0] || 1)) * width,
    height - ((y - minY) / (maxY - minY || 1)) * height,
  ];
  const d = points.map((p, i) => {
    const [sx, sy] = toSVG(p.x, p.y);
    return `${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
  }).join(" ");
  const fill = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      {filled && (
        <path d={fill} fill={`url(#grad-${color.replace("#", "")})`} opacity="0.18" />
      )}
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

// ── Hex grid background ────────────────────────────────────────────────────────
function HexBg() {
  return (
    <svg
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none", opacity: 0.18 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon
            points="30,2 58,16 58,44 30,58 2,44 2,16"
            fill="none"
            stroke={C.cyan}
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  );
}

// ── Scan line overlay ──────────────────────────────────────────────────────────
function ScanLine() {
  return (
    <motion.div
      style={{
        position: "fixed", left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${C.cyan}88, transparent)`,
        zIndex: 1, pointerEvents: "none",
      }}
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ── Glitch text ────────────────────────────────────────────────────────────────
function GlitchText({ text, style = {} }) {
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      {text}
      <span style={{
        position: "absolute", left: "2px", top: 0, color: C.red,
        opacity: 0.4, clipPath: "inset(30% 0 50% 0)", fontFamily: "inherit",
        fontSize: "inherit", fontWeight: "inherit",
      }}>{text}</span>
      <span style={{
        position: "absolute", left: "-2px", top: 0, color: C.cyan,
        opacity: 0.35, clipPath: "inset(60% 0 10% 0)", fontFamily: "inherit",
        fontSize: "inherit", fontWeight: "inherit",
      }}>{text}</span>
    </span>
  );
}

// ── Circular trust meter ───────────────────────────────────────────────────────
function TrustMeter({ score }) {
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score > 75 ? C.green : score > 50 ? C.yellow : C.red;
  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <motion.circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - pct * circ }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ transformOrigin: "center", transform: "rotate(-90deg)", filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <circle cx={cx} cy={cy} r={r - 14} fill="rgba(0,20,40,0.7)" />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <motion.span
          key={score}
          animate={{ opacity: [0, 1] }}
          style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'Courier New', monospace", lineHeight: 1 }}
        >
          {score}
        </motion.span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginTop: 2 }}>TRUST</span>
      </div>
    </div>
  );
}

// ── Live ticker ────────────────────────────────────────────────────────────────
const EVENTS = [
  { id: 1, msg: "Login from New Delhi · device fingerprint matched", level: "ok" },
  { id: 2, msg: "Keystroke velocity: nominal", level: "ok" },
  { id: 3, msg: "Geo-velocity check passed", level: "ok" },
  { id: 4, msg: "Unusual tab-switch pattern detected", level: "warn" },
  { id: 5, msg: "Mouse entropy: HIGH — possible bot signature", level: "danger" },
  { id: 6, msg: "Transaction blocked · risk threshold exceeded", level: "danger" },
  { id: 7, msg: "2FA challenge issued", level: "warn" },
  { id: 8, msg: "Behavioral baseline re-calibrating…", level: "ok" },
];

// ── Transactions ───────────────────────────────────────────────────────────────
const TXS = [
  { id: "TX-9921", merchant: "Amazon India", amount: "₹4,299", time: "09:42", risk: 12 },
  { id: "TX-9920", merchant: "Swiggy", amount: "₹389", time: "08:17", risk: 8 },
  { id: "TX-9919", merchant: "Unknown Offshore", amount: "₹92,000", time: "07:55", risk: 94 },
  { id: "TX-9918", merchant: "Flipkart", amount: "₹1,199", time: "yesterday", risk: 5 },
  { id: "TX-9917", merchant: "Crypto Gateway", amount: "₹50,000", time: "yesterday", risk: 88 },
];

// ── AI insight badges ──────────────────────────────────────────────────────────
const INSIGHTS = [
  { label: "Typing rhythm", status: "NORMAL", ok: true },
  { label: "Device fingerprint", status: "MATCHED", ok: true },
  { label: "Mouse entropy", status: "ELEVATED", ok: false },
  { label: "Session duration", status: "NORMAL", ok: true },
  { label: "Geo-velocity", status: "PASSED", ok: true },
];

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, delta, color, points }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "14px 18px", backdropFilter: "blur(12px)",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <span style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "'Courier New', monospace" }}>{value}</span>
        <Sparkline points={points} color={color} width={80} height={36} filled />
      </div>
      <span style={{ fontSize: 11, color: delta > 0 ? C.red : C.green }}>
        {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last session
      </span>
    </div>
  );
}

// ── Fraud popup ────────────────────────────────────────────────────────────────
function FraudAlert({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      }}
    >
      <div style={{
        background: "rgba(10,5,20,0.97)", border: `1.5px solid ${C.red}`,
        borderRadius: 16, padding: "36px 42px", maxWidth: 420, textAlign: "center",
        boxShadow: `0 0 60px ${C.red}55`,
      }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{ fontSize: 48, marginBottom: 12 }}
        >⚠️</motion.div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.red, letterSpacing: 3, marginBottom: 8 }}>
          FRAUD DETECTED
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 24, lineHeight: 1.7 }}>
          Anomalous behavioral signature identified.<br />
          Transaction <strong style={{ color: "white" }}>TX-9919</strong> has been blocked.<br />
          Trust score dropped to <strong style={{ color: C.red }}>18 / 100</strong>.
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: C.red, color: "white", border: "none",
            borderRadius: 8, padding: "10px 32px", fontSize: 13,
            fontWeight: 700, cursor: "pointer", letterSpacing: 2,
          }}
        >
          ACKNOWLEDGE
        </button>
      </div>
    </motion.div>
  );
}

// ── Login page ─────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [typing, setTyping] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastKey = useRef(null);

  const handleKey = (e) => {
    const now = Date.now();
    if (lastKey.current) {
      setTyping((t) => [...t.slice(-19), now - lastKey.current]);
    }
    lastKey.current = now;
  };

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => onLogin(), 2000);
  };

  const avgInterval = typing.length
    ? Math.round(typing.reduce((a, b) => a + b, 0) / typing.length)
    : null;

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <HexBg />
      <ScanLine />

      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "15%", left: "10%", width: 320, height: 320, borderRadius: "50%", background: C.cyan, opacity: 0.07, filter: "blur(90px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "#7b2ff7", opacity: 0.1, filter: "blur(80px)", pointerEvents: "none" }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          zIndex: 2, width: 380,
          background: "rgba(6,18,38,0.82)", border: `1px solid ${C.border}`,
          borderRadius: 20, padding: "40px 36px", backdropFilter: "blur(20px)",
          boxShadow: `0 0 40px rgba(0,245,255,0.1)`,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: `linear-gradient(135deg, ${C.cyan}33, #7b2ff733)`,
            border: `1px solid ${C.cyan}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px", fontSize: 26,
          }}>🛡️</div>
          <GlitchText
            text="NEUROSHIELD"
            style={{
              fontSize: 22, fontWeight: 900, color: C.cyan,
              fontFamily: "'Courier New', monospace", letterSpacing: 4,
              filter: `drop-shadow(0 0 12px ${C.cyan})`,
            }}
          />
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 3, marginTop: 4 }}>
            AI-POWERED BANKING SECURITY
          </div>
        </div>

        {/* Fields */}
        {[
          { label: "USER ID", val: user, set: setUser, type: "text" },
          { label: "ACCESS KEY", val: pass, set: setPass, type: "password" },
        ].map(({ label, val, set, type }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, color: C.cyanDim, letterSpacing: 3, display: "block", marginBottom: 6 }}>
              {label}
            </label>
            <input
              type={type}
              value={val}
              onChange={(e) => set(e.target.value)}
              onKeyDown={handleKey}
              placeholder={type === "text" ? "user@neuroshield.ai" : "••••••••"}
              style={{
                width: "100%", padding: "11px 14px",
                background: "rgba(0,245,255,0.05)", border: `1px solid ${C.border}`,
                borderRadius: 8, color: "white", fontSize: 13,
                fontFamily: "'Courier New', monospace", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        {/* Behavioral readout */}
        <div style={{
          background: "rgba(0,245,255,0.04)", border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 11,
          fontFamily: "'Courier New', monospace", color: C.cyanDim,
          display: "flex", justifyContent: "space-between",
        }}>
          <span>⌨ TYPING RHYTHM</span>
          <span style={{ color: C.green }}>
            {avgInterval ? `${avgInterval}ms avg` : "ANALYZING…"}
          </span>
        </div>

        {/* Login button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 10, border: "none",
            background: loading
              ? "rgba(0,245,255,0.15)"
              : `linear-gradient(90deg, ${C.cyan}cc, #2563eb)`,
            color: "white", fontSize: 13, fontWeight: 800,
            letterSpacing: 3, cursor: loading ? "default" : "pointer",
            fontFamily: "'Courier New', monospace",
          }}
        >
          {loading ? (
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
              AUTHENTICATING…
            </motion.span>
          ) : "SECURE LOGIN →"}
        </motion.button>

        {/* Status strip */}
        <div style={{
          marginTop: 20, display: "flex", gap: 8, justifyContent: "center",
          fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1,
        }}>
          {["AES-256", "ZERO-TRUST", "AI-GUARD"].map((s) => (
            <span key={s} style={{
              padding: "3px 8px", border: `1px solid ${C.border}`,
              borderRadius: 4, color: C.cyanDim,
            }}>{s}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function Dashboard() {
  const [trust, setTrust] = useState(82);
  const [events, setEvents] = useState([EVENTS[0], EVENTS[1], EVENTS[2]]);
  const [showFraud, setShowFraud] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [riskPts, setRiskPts] = useState(genPoints(24, 18, 10));
  const [txPts, setTxPts] = useState(genPoints(24, 30, 12));
  const [tick, setTick] = useState(0);

  // live tick
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!simulating) return;
    setRiskPts((p) => [...p.slice(1), { x: p[p.length - 1].x + 1, y: rand(5, 20) }]);
  }, [tick, simulating]);

  const simulateFraud = () => {
    if (simulating) return;
    setSimulating(true);
    const steps = [
      { delay: 600, trust: 65, event: EVENTS[3] },
      { delay: 1400, trust: 41, event: EVENTS[4] },
      { delay: 2400, trust: 18, event: EVENTS[5] },
      { delay: 3200, trust: 18, event: EVENTS[6], fraud: true },
    ];
    steps.forEach(({ delay, trust: t, event, fraud }) => {
      setTimeout(() => {
        setTrust(t);
        setEvents((e) => [event, ...e].slice(0, 8));
        setRiskPts((p) => [...p.slice(1), { x: p[p.length - 1].x + 1, y: rand(65, 95) }]);
        if (fraud) setShowFraud(true);
      }, delay);
    });
  };

  const resetDemo = () => {
    setTrust(82);
    setSimulating(false);
    setShowFraud(false);
    setEvents([EVENTS[0], EVENTS[1], EVENTS[2]]);
    setRiskPts(genPoints(24, 18, 10));
  };

  const riskColor = trust > 75 ? C.green : trust > 50 ? C.yellow : C.red;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden" }}>
      <HexBg />
      <ScanLine />

      <AnimatePresence>{showFraud && <FraudAlert onDismiss={() => { setShowFraud(false); resetDemo(); }} />}</AnimatePresence>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: "0 20px 40px" }}>

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 0 12px", borderBottom: `1px solid ${C.border}`, marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <GlitchText
              text="NEUROSHIELD"
              style={{
                fontSize: 18, fontWeight: 900, color: C.cyan,
                fontFamily: "'Courier New', monospace", letterSpacing: 4,
                filter: `drop-shadow(0 0 10px ${C.cyan})`,
              }}
            />
            <span style={{
              fontSize: 10, color: C.green, border: `1px solid ${C.green}55`,
              padding: "2px 8px", borderRadius: 4, letterSpacing: 2,
            }}>● LIVE</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={simulateFraud}
              disabled={simulating}
              style={{
                padding: "8px 20px", background: simulating ? "rgba(255,45,85,0.2)" : "rgba(255,45,85,0.15)",
                border: `1px solid ${C.red}55`, borderRadius: 8, color: C.red,
                fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: simulating ? "default" : "pointer",
              }}
            >
              {simulating ? "⚡ SIMULATING…" : "⚡ SIMULATE FRAUD"}
            </button>
            <button
              onClick={resetDemo}
              style={{
                padding: "8px 20px", background: "rgba(0,245,255,0.08)",
                border: `1px solid ${C.border}`, borderRadius: 8, color: C.cyan,
                fontSize: 11, fontWeight: 700, letterSpacing: 2, cursor: "pointer",
              }}
            >
              ↺ RESET
            </button>
          </div>
        </div>

        {/* Stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          <StatCard label="Threats Blocked" value="1,249" delta={-12} color={C.green} points={genPoints(24, 30, 8)} />
          <StatCard label="Risk Score" value={`${100 - trust}`} delta={simulating ? 47 : -5} color={riskColor} points={riskPts} />
          <StatCard label="Sessions Today" value="3" delta={0} color={C.cyan} points={genPoints(24, 10, 4)} />
          <StatCard label="Tx Monitored" value="127" delta={-3} color={C.cyanDim} points={txPts} />
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 16 }}>

          {/* Left: trust + insights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: C.panel, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "20px 16px", backdropFilter: "blur(12px)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 3 }}>
                TRUST SCORE
              </span>
              <TrustMeter score={trust} />
              <div style={{
                width: "100%", padding: "8px 12px",
                background: `${riskColor}14`, border: `1px solid ${riskColor}44`,
                borderRadius: 8, textAlign: "center",
                fontSize: 11, color: riskColor, fontWeight: 700, letterSpacing: 2,
              }}>
                {trust > 75 ? "✓ LOW RISK" : trust > 50 ? "⚠ MEDIUM RISK" : "✖ HIGH RISK"}
              </div>
            </div>

            {/* AI Insights */}
            <div style={{
              background: C.panel, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "16px", backdropFilter: "blur(12px)",
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 3, marginBottom: 12 }}>
                AI BEHAVIORAL ANALYSIS
              </div>
              {INSIGHTS.map((ins) => (
                <div key={ins.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 0", borderBottom: `1px solid rgba(255,255,255,0.04)`,
                }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{ins.label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 1,
                    color: ins.label === "Mouse entropy" && simulating ? C.red : (ins.ok ? C.green : C.amber),
                  }}>
                    {ins.label === "Mouse entropy" && simulating ? "ANOMALY" : ins.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Centre: risk graph + transactions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Risk graph */}
            <div style={{
              background: C.panel, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "20px 22px", backdropFilter: "blur(12px)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 3 }}>
                  RISK LEVEL · LAST 24 SIGNALS
                </span>
                <span style={{ fontSize: 11, color: riskColor, fontFamily: "'Courier New', monospace" }}>
                  SCORE {100 - trust}
                </span>
              </div>
              <Sparkline points={riskPts} color={riskColor} width={560} height={80} filled />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                <span>-24</span><span>-18</span><span>-12</span><span>-6</span><span>NOW</span>
              </div>
            </div>

            {/* Transactions */}
            <div style={{
              background: C.panel, border: `1px solid ${C.border}`,
              borderRadius: 14, padding: "18px 20px", backdropFilter: "blur(12px)", flex: 1,
            }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 3, marginBottom: 14 }}>
                TRANSACTION MONITOR
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 90px 70px 60px", gap: "8px 12px", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginBottom: 8 }}>
                <span>TX ID</span><span>MERCHANT</span><span>AMOUNT</span><span>TIME</span><span>RISK</span>
              </div>
              {TXS.map((tx, i) => {
                const risky = tx.risk > 70;
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      display: "grid", gridTemplateColumns: "80px 1fr 90px 70px 60px",
                      gap: "8px 12px", padding: "9px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: risky && simulating ? "rgba(255,45,85,0.06)" : "transparent",
                      borderRadius: 4,
                    }}
                  >
                    <span style={{ fontSize: 11, color: C.cyan, fontFamily: "'Courier New', monospace" }}>{tx.id}</span>
                    <span style={{ fontSize: 11, color: risky && simulating ? C.red : "rgba(255,255,255,0.7)" }}>{tx.merchant}</span>
                    <span style={{ fontSize: 11, color: "white", fontFamily: "'Courier New', monospace" }}>{tx.amount}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{tx.time}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: `rgba(255,255,255,0.08)`,
                        overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%", width: `${tx.risk}%`,
                          background: tx.risk > 70 ? C.red : tx.risk > 40 ? C.yellow : C.green,
                          borderRadius: 2,
                        }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: live event log */}
          <div style={{
            background: C.panel, border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "18px 16px", backdropFilter: "blur(12px)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 3, marginBottom: 14 }}>
              LIVE THREAT LOG
            </div>
            <div style={{ fontFamily: "'Courier New', monospace", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              <AnimatePresence mode="popLayout">
                {events.map((ev) => (
                  <motion.div
                    key={ev.id + ev.msg}
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      padding: "9px 11px", borderRadius: 8, fontSize: 11, lineHeight: 1.5,
                      background: ev.level === "danger"
                        ? "rgba(255,45,85,0.1)"
                        : ev.level === "warn"
                          ? "rgba(255,230,0,0.08)"
                          : "rgba(0,245,255,0.05)",
                      border: `1px solid ${ev.level === "danger" ? C.red + "44" : ev.level === "warn" ? C.yellow + "44" : C.border}`,
                      color: ev.level === "danger" ? C.red : ev.level === "warn" ? C.yellow : "rgba(255,255,255,0.55)",
                    }}
                  >
                    <span style={{ opacity: 0.5, fontSize: 10 }}>
                      {ev.level === "danger" ? "✖" : ev.level === "warn" ? "⚠" : "✓"}{" "}
                    </span>
                    {ev.msg}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom status strip */}
            <div style={{
              marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`,
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              {[
                { label: "Model", val: "BehaviorNet v3.2" },
                { label: "Signals/sec", val: "1,240" },
                { label: "Latency", val: "4ms" },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>{label}</span>
                  <span style={{ color: C.cyan, fontFamily: "'Courier New', monospace" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn
    ? <Dashboard />
    : <Login onLogin={() => setLoggedIn(true)} />;
}