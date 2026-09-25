import { DEFAULT_BUSINESS_RULES, BusinessRulesConfig } from "./rules";

export interface PersonalCommissionResult {
  alp: number;
  rate: number;
  monthlyCommission: number;
  total24Months: number;
  durationMonths: number;
  formulaText: string;
}

export function calculatePersonalCommission(
  alp: number,
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): PersonalCommissionResult {
  if (alp < 0) {
    throw new Error("ALP tidak boleh bernilai negatif");
  }

  const rate = rules.personalCommissionRate;
  const monthlyCommission = Math.round((alp * rate) / rules.monthsPerYear);
  const durationMonths = rules.personalCommissionDurationMonths;
  const total24Months = Math.round(monthlyCommission * durationMonths);

  const formattedAlp = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(alp);

  const formattedMonthly = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(monthlyCommission);

  const ratePercentText = (rate * 100).toFixed(2).replace(".", ",") + "%";

  const formulaText = `${formattedAlp} × ${ratePercentText} ÷ ${rules.monthsPerYear} = ${formattedMonthly}/bulan`;

  return {
    alp,
    rate,
    monthlyCommission,
    total24Months,
    durationMonths,
    formulaText,
  };
}
