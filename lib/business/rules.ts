export interface BusinessRulesConfig {
  bpQualificationALP: number;
  personalCommissionRate: number;
  directBpOverrideRatio: number;
  directBpOverrideRate: number;
  bpOnBpOverrideRatio: number;
  bpOnBpRate: number;
  personalCommissionDurationMonths: number;
  monthsPerYear: number;
  scheme2MinContributorALP: number;
}

export const DEFAULT_BUSINESS_RULES: BusinessRulesConfig = {
  bpQualificationALP: 300_000_000,
  personalCommissionRate: 0.2325, // 23.25%
  directBpOverrideRatio: 0.55, // 55%
  directBpOverrideRate: 0.127875, // 23.25% * 55% = 12.7875%
  bpOnBpOverrideRatio: 0.20, // 20%
  bpOnBpRate: 0.0465, // 23.25% * 20% = 4.65%
  personalCommissionDurationMonths: 24, // 24 bulan
  monthsPerYear: 12,
  scheme2MinContributorALP: 50_000_000, // 50 juta
};
