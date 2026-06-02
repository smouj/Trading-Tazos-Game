// ============================================================
// TTG Multiplayer WebSocket Server (Node.js)
// Matchmaking + room-based PvP relay.
// Zero external deps except ws@7 (no transitive deps).
// JWT verified with native crypto — no jsonwebtoken needed.
// ============================================================
/* eslint-disable @typescript-eslint/no-require-imports */

const { Server: WebSocketServer } = require("ws")
const crypto = require("crypto")

const JWT_SECRET = process.env.JWT_SECRET || "***"
const PORT = parseInt(process.env.WS_PORT || "3001")
const HEARTBEAT_MS = 15000

// ─── Native JWT verify (HS256 only) ─────────────────────────
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) str += "="
  return JSON.parse(Buffer.from(str, "base64").toString("utf8"))
}

function verifyToken(token) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, sigB64] = parts
    const header = base64UrlDecode(headerB64)
    if (header.alg !== "HS256") return null
    const data = `${headerB64}.${payloadB64}`
    const sig = base64UrlDecode(sigB64)  // raw sig or base64? Let's use HMAC compare
    const expected = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url")
    if (sigB64 !== expected) return null
    const payload = base64UrlDecode(payloadB64)
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return { userId: payload.id, name: payload.name }
  } catch { return null }
}

// ─── State ──────────────────────────────────────────────────
const queue = []
const rooms = new Map()
const connections = new Map()

function send(ws, msg) {
  if (ws.readyState === 1) ws.send(JSON.stringify(msg))
}

function makeRoom(p1, p2) {
  const id = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const room = { id, players: [p1, p2], createdAt: Date.now(), gameState: "waiting" }
  rooms.set(id, room)
  for (const p of [p1, p2]) {
    const opp = p === p1 ? p2 : p1
    send(p.ws, { type: "match_found", payload: { roomId: id, opponent: { userId: opp.userId, name: opp.name }, yourSide: p === p1 ? "player" : "opponent" } })
  }
  console.log(`[WS] Match: ${p1.name} vs ${p2.name} [${id}]`)
  return room
}

function cleanupPlayer(player) {
  const qIdx = queue.indexOf(player)
  if (qIdx >= 0) queue.splice(qIdx, 1)
  for (const [id, room] of rooms) {
    const idx = room.players.indexOf(player)
    if (idx >= 0) {
      const opp = room.players[1 - idx]
      if (room.gameState !== "finished") send(opp.ws, { type: "opponent_disconnected", payload: { message: "Your opponent disconnected" } })
      rooms.delete(id)
      break
    }
  }
  connections.delete(player.ws)
}

function tryMatch() {
  while (queue.length >= 2) makeRoom(queue.shift(), queue.shift())
}

// ─── Server ─────────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT })
console.log(`[WS] Multiplayer server on port ${PORT}`)

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`)
  const token = url.searchParams.get("token") || ""
  const user = verifyToken(token)
  if (!user) { ws.close(4001, "Unauthorized"); return }

  const player = { ws, userId: user.userId, name: user.name, joinedAt: Date.now(), alive: true }
  connections.set(ws, player)
  console.log(`[WS] ${player.name} connected (${connections.size} online)`)

  let alive = true
  const pingTimer = setInterval(() => {
    if (!alive) { ws.terminate(); return }
    alive = false
    ws.ping()
  }, HEARTBEAT_MS)

  ws.on("pong", () => { alive = true })

  ws.on("message", (raw) => {
    let msg
    try { msg = JSON.parse(raw.toString()) } catch { return }

    switch (msg.type) {
      case "join_queue":
        if (!queue.includes(player)) {
          queue.push(player)
          send(ws, { type: "queue_status", payload: { position: queue.length } })
          tryMatch()
        }
        break
      case "leave_queue":
        const idx = queue.indexOf(player)
        if (idx >= 0) queue.splice(idx, 1)
        send(ws, { type: "queue_left" })
        break
      case "turn_action":
        for (const [, room] of rooms) {
          const idx = room.players.indexOf(player)
          if (idx >= 0) {
            room.gameState = "playing"
            send(room.players[1 - idx].ws, { type: "turn_received", payload: msg.payload })
            break
          }
        }
        break
      case "turn_result":
        for (const [, room] of rooms) {
          const idx = room.players.indexOf(player)
          if (idx >= 0) { send(room.players[1 - idx].ws, { type: "turn_result", payload: msg.payload }); break }
        }
        break
      case "game_over":
        for (const [id, room] of rooms) {
          if (room.players.includes(player)) {
            room.gameState = "finished"
            const opp = room.players.find(p => p !== player)
            if (opp) send(opp.ws, { type: "game_over", payload: msg.payload })
            rooms.delete(id)
            break
          }
        }
        break
    }
  })

  ws.on("close", () => {
    clearInterval(pingTimer)
    cleanupPlayer(player)
    console.log(`[WS] ${player.name} disconnected`)
  })

  send(ws, { type: "connected", payload: { userId: player.userId, name: player.name } })
})

// ─── Status HTTP ─────────────────────────────────────────────
const http = require("http")
http.createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" })
  res.end(JSON.stringify({
    activeRooms: rooms.size,
    queueLength: queue.length,
    connectedClients: connections.size,
    uptime: process.uptime(),
  }))
}).listen(PORT + 1)
console.log(`[WS] Status HTTP on port ${PORT + 1}`)

process.on("SIGTERM", () => { wss.close(); process.exit(0) })
