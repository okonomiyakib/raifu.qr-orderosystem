import { TaxSettings, TaxType, DisplayMode } from "./types";

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  displayMode: "included",
  standardRate: 10,
  reducedRate: 8,
};

// 税率を取得
export function getTaxRate(taxType: TaxType, settings: TaxSettings): number {
  return taxType === "reduced" ? settings.reducedRate : settings.standardRate;
}

// 税込価格から税抜価格を逆算（表示用）
export function toExcludedPrice(includedPrice: number, taxType: TaxType, settings: TaxSettings): number {
  const rate = getTaxRate(taxType, settings);
  return Math.round(includedPrice / (1 + rate / 100));
}

// 表示価格を返す（displayModeに応じて税込/税抜）
export function displayPrice(
  price: number,
  taxType: TaxType,
  settings: TaxSettings
): { amount: number; label: string } {
  if (settings.displayMode === "excluded") {
    return {
      amount: toExcludedPrice(price, taxType, settings),
      label: "税抜",
    };
  }
  return { amount: price, label: "税込" };
}

// カートの税額内訳を計算
export function calcTaxBreakdown(
  items: { price: number; taxType: TaxType; quantity: number }[],
  settings: TaxSettings
) {
  let standardBase = 0;
  let reducedBase = 0;

  for (const item of items) {
    const subtotal = item.price * item.quantity;
    const rate = getTaxRate(item.taxType, settings);
    const base = Math.round(subtotal / (1 + rate / 100));
    if (item.taxType === "reduced") {
      reducedBase += base;
    } else {
      standardBase += base;
    }
  }

  const standardTax = Math.round(standardBase * settings.standardRate / 100);
  const reducedTax = Math.round(reducedBase * settings.reducedRate / 100);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return { standardBase, reducedBase, standardTax, reducedTax, total };
}

export function taxTypeLabel(taxType: TaxType, settings: TaxSettings): string {
  const rate = getTaxRate(taxType, settings);
  return taxType === "reduced" ? `軽減税率${rate}%` : `標準税率${rate}%`;
}

export function displayModeLabel(mode: DisplayMode): string {
  return mode === "included" ? "税込表示" : "税抜表示";
}
