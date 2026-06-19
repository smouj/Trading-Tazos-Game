// App route loading skeleton — fullscreen dark arena overlay
// Uses fixed positioning to cover the entire viewport including shell chrome
export default function AppRouteLoading() {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem",
        background: "#0a0a0a",
      }}
    >
      {/* Scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
      }} />
      {/* Diagonal metallic pattern */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.06,
        backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,204,0,0.3) 8px, rgba(255,204,0,0.3) 10px)",
      }} />

      {/* Spinner rings */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          border: "3px solid rgba(255,204,0,0.12)", borderTopColor: "var(--ttg-yellow)",
          animation: "spin 0.8s linear infinite",
          boxShadow: "0 0 32px rgba(255,204,0,0.15)",
        }} />
        <div style={{
          position: "absolute", inset: -6, borderRadius: "50%",
          border: "2px solid rgba(255,204,0,0.06)",
          animation: "ping 1.5s ease-out infinite",
        }} />
      </div>

      {/* Label */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <p style={{
          fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.7)",
          textTransform: "uppercase", letterSpacing: "0.25em", margin: 0,
        }}>
          Entering Arena…
        </p>
        <p style={{
          fontSize: 8, fontWeight: 700, color: "rgba(255,204,0,0.25)",
          textTransform: "uppercase", letterSpacing: "0.4em", marginTop: 8,
        }}>
          Preparing Battle
        </p>
      </div>
    </div>
  )
}
