/**
 * Formats a number to Indonesian Rupiah currency string.
 * e.g. 1937500 -> "Rp 1.937.500"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compact Indonesian formatting: e.g. 300_000_000 -> "Rp 300 Jt", 1_200_000_000 -> "Rp 1,2 M"
 */
export function formatCompactRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "Rp 0";
  }
  if (Math.abs(amount) >= 1_000_000_000) {
    const b = amount / 1_000_000_000;
    return `Rp ${b.toFixed(1).replace(".", ",")} M`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    const m = amount / 1_000_000;
    return `Rp ${Number.isInteger(m) ? m : m.toFixed(1).replace(".", ",")} Jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    const k = amount / 1_000;
    return `Rp ${k.toFixed(0)} Rb`;
  }
  return formatRupiah(amount);
}

/**
 * Parses a flexible Indonesian user input into a normalized integer number.
 * Accepts:
 * - "100000000" -> 100000000
 * - "100 juta" -> 100000000
 * - "100jt" -> 100000000
 * - "100m" -> 100000000
 * - "1,5m" / "1.5m" -> 1500000000
 * - "50 rb" / "50k" -> 50000
 * - "Rp 100.000.000" -> 100000000
 */
export function parseRupiahInput(input: string | number): number {
  if (typeof input === "number") {
    return Math.max(0, Math.round(input));
  }
  if (!input || typeof input !== "string") {
    return 0;
  }

  const clean = input.trim().toLowerCase().replace(/rp/g, "").trim();

  // Check for Milyar / M / B (billion in Indonesian)
  if (clean.includes("milyar") || clean.includes("miliar") || clean.endsWith("b")) {
    const numPart = clean.replace(/milyar|miliar|b/g, "").replace(/\./g, "").replace(",", ".").trim();
    const val = parseFloat(numPart);
    return isNaN(val) ? 0 : Math.round(val * 1_000_000_000);
  }

  // Check for "m" (could be Milyar or Million, in Indo financial contexts "M" usually means Miliar, but "jt" means juta)
  if (clean.endsWith("m") && !clean.endsWith("jt")) {
    const numPart = clean.replace("m", "").replace(/\./g, "").replace(",", ".").trim();
    const val = parseFloat(numPart);
    return isNaN(val) ? 0 : Math.round(val * 1_000_000_000);
  }

  // Check for Juta / Jt
  if (clean.includes("juta") || clean.includes("jt")) {
    const numPart = clean.replace(/juta|jt/g, "").replace(/\./g, "").replace(",", ".").trim();
    const val = parseFloat(numPart);
    return isNaN(val) ? 0 : Math.round(val * 1_000_000);
  }

  // Check for Ribu / Rb / K
  if (clean.includes("ribu") || clean.includes("rb") || clean.endsWith("k")) {
    const numPart = clean.replace(/ribu|rb|k/g, "").replace(/\./g, "").replace(",", ".").trim();
    const val = parseFloat(numPart);
    return isNaN(val) ? 0 : Math.round(val * 1_000);
  }

  // Raw numeric string with possible dots or commas as thousand separators
  // e.g. "100.000.000" or "100000000"
  const digitsOnly = clean.replace(/[^0-9]/g, "");
  const result = parseInt(digitsOnly, 10);
  return isNaN(result) ? 0 : Math.max(0, result);
}
