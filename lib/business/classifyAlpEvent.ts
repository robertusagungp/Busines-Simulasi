import { BusinessRulesConfig, DEFAULT_BUSINESS_RULES } from "./rules";
import { AlpClassification, PersonStatus } from "./types";

export interface TrancheClassificationResult {
  amount: number;
  fromAlp: number;
  toAlp: number;
  producerStatusAtEvent: PersonStatus;
  parentStatusAtEvent?: PersonStatus;
  classification: AlpClassification;
  rateAppliedToParent: number;
  monthlyIncomeToParent: number;
  rateAppliedToProducer: number;
  monthlyIncomeToProducer: number;
  triggersPromotion: boolean;
  explanation: string;
}

/**
 * Classifies an ALP event bucket given immutable context at event time.
 * Follows the core rule:
 * Rate(ALP event) = f(parentStatusAtEvent, producerStatusAtEvent)
 */
export function classifyAlpEventContext(
  producerStatus: PersonStatus,
  parentStatus?: PersonStatus,
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): {
  classification: AlpClassification;
  parentRate: number;
  explanation: string;
} {
  // If there is no parent, this is purely personal production
  if (!parentStatus) {
    return {
      classification: "PERSONAL",
      parentRate: 0,
      explanation: "Produksi personal (tanpa upline).",
    };
  }

  // Parent is BE: BE never receives overriding from downline production
  if (parentStatus === "BE") {
    return {
      classification: "NO_OVERRIDE",
      parentRate: 0,
      explanation: `Upline masih berstatus BE saat ALP dihasilkan. BE tidak menerima overriding (0%).`,
    };
  }

  // Parent is BP, child is BE: Direct BP Overriding
  if (parentStatus === "BP" && producerStatus === "BE") {
    return {
      classification: "DIRECT_BP_OVERRIDE",
      parentRate: rules.directBpOverrideRate,
      explanation: `Upline BP & Mitra BE. Menghasilkan Direct BP Overriding sebesar ${(rules.directBpOverrideRate * 100).toFixed(4).replace(".", ",")}% / 12.`,
    };
  }

  // Parent is BP, child is BP: BP-on-BP Overriding
  if (parentStatus === "BP" && producerStatus === "BP") {
    return {
      classification: "BP_ON_BP",
      parentRate: rules.bpOnBpRate,
      explanation: `Upline BP & Mitra BP. Menghasilkan BP-on-BP Overriding sebesar ${(rules.bpOnBpRate * 100).toFixed(2).replace(".", ",")}% / 12.`,
    };
  }

  return {
    classification: "NO_OVERRIDE",
    parentRate: 0,
    explanation: "Tidak ada overriding yang berlaku.",
  };
}

/**
 * Handles ALP production that may span across the BP qualification threshold (e.g. from 250m to 350m).
 * Splits the transaction into immutable historical tranches based on status transitions.
 */
export function splitAndClassifyAlpTransaction(
  currentProducerAlp: number,
  additionalAlp: number,
  parentStatus?: PersonStatus,
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): TrancheClassificationResult[] {
  if (additionalAlp < 0) {
    throw new Error("Produksi ALP tambahan tidak boleh negatif");
  }

  if (additionalAlp === 0) {
    return [];
  }

  const threshold = rules.bpQualificationALP;
  const initialProducerStatus: PersonStatus =
    currentProducerAlp >= threshold ? "BP" : "BE";
  const newTotalAlp = currentProducerAlp + additionalAlp;
  const tranches: TrancheClassificationResult[] = [];

  // Case 1: Producer was already BP before this transaction
  if (currentProducerAlp >= threshold) {
    const context = classifyAlpEventContext("BP", parentStatus, rules);
    const monthlyParent = Math.round((additionalAlp * context.parentRate) / rules.monthsPerYear);
    const monthlyProducer = Math.round((additionalAlp * rules.personalCommissionRate) / rules.monthsPerYear);

    tranches.push({
      amount: additionalAlp,
      fromAlp: currentProducerAlp,
      toAlp: newTotalAlp,
      producerStatusAtEvent: "BP",
      parentStatusAtEvent: parentStatus,
      classification: context.classification,
      rateAppliedToParent: context.parentRate,
      monthlyIncomeToParent: monthlyParent,
      rateAppliedToProducer: rules.personalCommissionRate,
      monthlyIncomeToProducer: monthlyProducer,
      triggersPromotion: false,
      explanation: context.explanation,
    });

    return tranches;
  }

  // Case 2: Producer was BE and stays BE (total < 300m)
  if (newTotalAlp < threshold) {
    const context = classifyAlpEventContext("BE", parentStatus, rules);
    const monthlyParent = Math.round((additionalAlp * context.parentRate) / rules.monthsPerYear);
    const monthlyProducer = Math.round((additionalAlp * rules.personalCommissionRate) / rules.monthsPerYear);

    tranches.push({
      amount: additionalAlp,
      fromAlp: currentProducerAlp,
      toAlp: newTotalAlp,
      producerStatusAtEvent: "BE",
      parentStatusAtEvent: parentStatus,
      classification: context.classification,
      rateAppliedToParent: context.parentRate,
      monthlyIncomeToParent: monthlyParent,
      rateAppliedToProducer: rules.personalCommissionRate,
      monthlyIncomeToProducer: monthlyProducer,
      triggersPromotion: false,
      explanation: context.explanation,
    });

    return tranches;
  }

  // Case 3: Producer crosses or hits the threshold (reaches >= 300m)
  // Portion 1: ALP from currentProducerAlp up to 300m (produced while BE)
  const portion1 = threshold - currentProducerAlp;
  if (portion1 > 0) {
    const context1 = classifyAlpEventContext("BE", parentStatus, rules);
    const monthlyParent1 = Math.round((portion1 * context1.parentRate) / rules.monthsPerYear);
    const monthlyProducer1 = Math.round((portion1 * rules.personalCommissionRate) / rules.monthsPerYear);

    tranches.push({
      amount: portion1,
      fromAlp: currentProducerAlp,
      toAlp: threshold,
      producerStatusAtEvent: "BE",
      parentStatusAtEvent: parentStatus,
      classification: context1.classification,
      rateAppliedToParent: context1.parentRate,
      monthlyIncomeToParent: monthlyParent1,
      rateAppliedToProducer: rules.personalCommissionRate,
      monthlyIncomeToProducer: monthlyProducer1,
      triggersPromotion: true,
      explanation: `${context1.explanation} (Tranche kualifikasi mencapai Rp300jt)`,
    });
  }

  // Portion 2: ALP above 300m (produced after officially promoted to BP)
  const portion2 = newTotalAlp - threshold;
  if (portion2 > 0) {
    const context2 = classifyAlpEventContext("BP", parentStatus, rules);
    const monthlyParent2 = Math.round((portion2 * context2.parentRate) / rules.monthsPerYear);
    const monthlyProducer2 = Math.round((portion2 * rules.personalCommissionRate) / rules.monthsPerYear);

    tranches.push({
      amount: portion2,
      fromAlp: threshold,
      toAlp: newTotalAlp,
      producerStatusAtEvent: "BP",
      parentStatusAtEvent: parentStatus,
      classification: context2.classification,
      rateAppliedToParent: context2.parentRate,
      monthlyIncomeToParent: monthlyParent2,
      rateAppliedToProducer: rules.personalCommissionRate,
      monthlyIncomeToProducer: monthlyProducer2,
      triggersPromotion: false,
      explanation: `${context2.explanation} (Tranche setelah resmi promosi menjadi BP)`,
    });
  }

  return tranches;
}
