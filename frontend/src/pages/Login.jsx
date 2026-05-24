import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function Login({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [intervals, setIntervals] = useState([]);
  const [totalKeys, setTotalKeys] = useState(0);
  const lastKeyTime = useRef(null);

  const handleKeyDown = () => {
    const now = Date.now();
    if (lastKeyTime.current) {
      setIntervals((prev) => [...prev.slice(-19), now - lastKeyTime.current]);
    }
    lastKeyTime.current = now;
    setTotalKeys((k) => k + 1);
  };

  const avgInterval =
    intervals.length > 0
      ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
      : null;

  const handleLogin = () => {
    if (!userId.trim() || !pass.trim()) {
      setError("USER ID and ACCESS KEY are required.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      onLogin({ userId: userId.trim(), sessionId: "SES-" + Date.now() });
    }, 1800);
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(0,245,255,0.05)",
    border: "1px solid rgba(0,245,255,0.2)",
    borderRadius: 8,
    color: "white",
    fontSize: 13,
    fontFamily: "'Courier New', monospace",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020810",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* Hex bg */}
      <div className="hex-bg" />
      <div className="scanline" />

      {/* Glows */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 360, height: 360, borderRadius: "50%", background: "#00f5ff", opacity: 0.06, filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "8%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "#7b2ff7", opacity: 0.08, filter: "blur(90px)", pointerEvents: "none" }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          zIndex: 2,
          width: 400,
          background: "rgba(6,18,38,0.9)",
          border: "1px solid rgba(0,245,255,0.2)",
          borderRadius: 20,
          padding: "40px 36px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 60px rgba(0,245,255,0.07)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <motion.div
            animate={{ rotate: [0, 4, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              width: 60, height: 60, borderRadius: 15, margin: "0 auto 14px",
              background: "linear-gradient(135deg,rgba(0,245,255,0.15),rgba(123,47,247,0.2))",
              border: "1px solid rgba(0,245,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, boxShadow: "0 0 30px rgba(0,245,255,0.12)",
            }}
          >🛡️</motion.div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#00f5ff", letterSpacing: 5, textShadow: "0 0 20px #00f5ff" }}>
            NEUROSHIELD
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 3, marginTop: 4 }}>
            AI-POWERED BEHAVIORAL SECURITY
          </div>
        </div>

        {/* User ID */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#00b8c8", letterSpacing: 3, marginBottom: 6 }}>USER ID</div>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="user@neuroshield.ai"
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: "#00b8c8", letterSpacing: 3, marginBottom: 6 }}>ACCESS KEY</div>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        {/* Biometric strip */}
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 16,
          background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.12)",
          display: "flex", justifyContent: "space-between", fontSize: 11,
        }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>⌨ Keystroke rhythm</span>
          <span style={{ color: "#00f5ff" }}>
            {avgInterval ? `${avgInterval}ms avg · ${totalKeys} keys` : "ANALYZING…"}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 12, padding: "8px 12px", borderRadius: 6,
            background: "rgba(255,45,85,0.1)", border: "1px solid rgba(255,45,85,0.3)",
            color: "#ff2d55", fontSize: 12,
          }}>✖ {error}</div>
        )}

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 10, border: "none",
            background: loading ? "rgba(0,245,255,0.12)" : "linear-gradient(90deg,#00f5ffcc,#2563eb)",
            color: "white", fontSize: 13, fontWeight: 800, letterSpacing: 3,
            cursor: loading ? "default" : "pointer", fontFamily: "'Courier New', monospace",
          }}
        >
          {loading ? (
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
              AUTHENTICATING…
            </motion.span>
          ) : "SECURE LOGIN →"}
        </motion.button>

        {/* Badges */}
        <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["AES-256", "ZERO-TRUST", "BIOMETRIC", "AI-GUARD"].map((s) => (
            <span key={s} style={{
              padding: "3px 9px", border: "1px solid rgba(0,245,255,0.2)",
              borderRadius: 4, fontSize: 9, color: "#00b8c8", letterSpacing: 1,
            }}>{s}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}