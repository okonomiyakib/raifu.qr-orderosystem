import { NextResponse } from "next/server";

// POST /api/upload - ImgurへサーバーサイドでアップロードしURLを返す
export async function POST(req: Request) {
  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "IMGUR_CLIENT_IDが設定されていません" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "画像ファイルがありません" }, { status: 400 });
    }

    // ファイルをbase64に変換
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Imgur APIにアップロード
    const imgurRes = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${clientId}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64,
        type: "base64",
        name: file.name,
      }),
    });

    if (!imgurRes.ok) {
      const err = await imgurRes.text();
      console.error("Imgurエラー:", err);
      return NextResponse.json({ error: "Imgurへのアップロードに失敗しました" }, { status: 500 });
    }

    const data = await imgurRes.json();
    return NextResponse.json({ url: data.data.link });
  } catch (error) {
    console.error("アップロードエラー:", error);
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}
