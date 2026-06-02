import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:3002/status")
    if (!res.ok) throw new Error("WS status unreachable")
    const data = await res.json()
    return NextResponse.json({
      activeRooms: data.activeRooms,
      queueLength: data.queueLength,
      connectedClients: data.connectedClients,
      uptime: data.uptime,
    })
  } catch {
    return NextResponse.json(
      { activeRooms: 0, queueLength: 0, connectedClients: 0, uptime: 0, error: "WS server offline" },
      { status: 200 }
    )
  }
}
