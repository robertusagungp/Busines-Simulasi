import { DEFAULT_BUSINESS_RULES, BusinessRulesConfig } from "./rules";

export interface DirectOverrideResult {
  eligibleAlp: number;
  rate: number;
  monthlyOverride: number;
  formulaText: string;
}

export function calculateDirectOverride(
  eligibleAlp: number,
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): DirectOverrideResult {
  if (eligibleAlp < 0) {
    throw new Error("Eligible ALP tidak boleh bernilai negatif");
  }

  const rate = rules.directBpOverrideRate; // 0.127875
  const monthlyOverride = Math.round((eligibleAlp * rate) / rules.monthsPerYear);

  const formattedAlp = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(eligibleAlp);

  const formattedMonthly = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(monthlyOverride);

  const ratePercentText = (rate * 100).toFixed(4).replace(".", ",") + "%";

  const formulaText = `${formattedAlp} × ${ratePercentText} ÷ ${rules.monthsPerYear} = ${formattedMonthly}/bulan`;

  return {
    eligibleAlp,
    rate,
    monthlyOverride,
    formulaText,
  };
}
