import { NextResponse } from "next/server";
import { networkInterfaces } from "os";

export async function GET() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return NextResponse.json({ url: `http://${net.address}:3000` });
      }
    }
  }
  return NextResponse.json({ url: "http://localhost:3000" });
}
