"use client";

import { QRCodeSVG } from "qrcode.react";
import { Table } from "@/lib/types";
import { useRef } from "react";

interface QRCodeGeneratorProps {
  table: Table;
  appUrl: string;
}

export function QRCodeGenerator({ table, appUrl }: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const menuUrl = `${appUrl}/menu/${table.id}`;

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>テーブル${table.tableNumber} QRコード</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            h2 { font-size: 28px; margin-bottom: 8px; }
            p { color: #666; margin-bottom: 20px; }
            .qr-container { display: inline-block; padding: 16px; border: 2px solid #eee; border-radius: 12px; }
          </style>
        </head>
        <body>
          <h2>テーブル ${table.tableNumber}</h2>
          <p>QRコードを読み込んでご注文ください</p>
          <div class="qr-container">
            ${qrRef.current?.innerHTML ?? ""}
          </div>
          <p style="margin-top:16px; font-size:12px; color:#999;">${menuUrl}</p>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
      <h3 className="text-lg font-bold text-gray-800 mb-1">
        テーブル {table.tableNumber}
      </h3>
      <p className="text-sm text-gray-400 mb-4">{table.name}</p>

      <div ref={qrRef} className="flex justify-center mb-4">
        <QRCodeSVG
          value={menuUrl}
          size={160}
          bgColor="#ffffff"
          fgColor="#1a1a1a"
          level="M"
          includeMargin
        />
      </div>

      <p className="text-xs text-gray-400 mb-4 break-all px-2">{menuUrl}</p>

      <div className="flex gap-2">
        <button
          onClick={handlePrint}
          className="flex-1 py-3 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors"
        >
          印刷する
        </button>
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold text-center hover:bg-orange-600 transition-colors"
        >
          プレビュー
        </a>
      </div>
    </div>
  );
}
