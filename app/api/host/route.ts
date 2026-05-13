import { NextResponse } from "next/server";
import { networkInterfaces } from "os";

export async function GET() {
  // 本番環境: 明示的に設定された公開URLを優先
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ url: process.env.NEXT_PUBLIC_APP_URL });
  }
  // Vercel自動提供URL (VERCEL_URLはhttpsプレフィックスなし)
  if (process.env.VERCEL_URL) {
    return NextResponse.json({ url: `https://${process.env.VERCEL_URL}` });
  }
  // ローカル開発環境: LAN IPを検出
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
