import { BusinessRulesConfig, DEFAULT_BUSINESS_RULES } from "./rules";
import { AlpEvent, Person, PromotionEvent, ScenarioIncomeSummary } from "./types";
import { getPersonCurrentStatus, getPersonPersonalAlp } from "./calculateOrganization";

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function calculateScenarioIncome(
  mainPersonId: string,
  people: Person[],
  alpEvents: AlpEvent[],
  promotions: PromotionEvent[],
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): ScenarioIncomeSummary {
  const mainStatus = getPersonCurrentStatus(mainPersonId, people, promotions);
  const mainPersonalAlp = getPersonPersonalAlp(mainPersonId, alpEvents);

  // Find all people in the scenario
  const peopleMap = new Map<string, Person>();
  people.forEach((p) => peopleMap.set(p.id, p));

  // Find direct downlines of main person
  const directChildren = people.filter((p) => p.parentId === mainPersonId);
  const directChildIds = new Set(directChildren.map((c) => c.id));

  // 1. Personal Commission of Main Person
  const personalEvents = alpEvents.filter((e) => e.personId === mainPersonId);
  const personalCommissionMonthly = personalEvents.reduce(
    (sum, e) => sum + e.monthlyIncomeToProducer,
    0
  );

  // 2. BP Direct Overriding (where Main is parent, classification is DIRECT_BP_OVERRIDE)
  const directBpEvents = alpEvents.filter(
    (e) => directChildIds.has(e.personId) && e.classification === "DIRECT_BP_OVERRIDE"
  );
  const directBpOverrideMonthly = directBpEvents.reduce(
    (sum, e) => sum + e.monthlyIncomeToParent,
    0
  );

  // 3. BP-on-BP Overriding (where Main is parent, classification is BP_ON_BP)
  const bpOnBpEvents = alpEvents.filter(
    (e) => directChildIds.has(e.personId) && e.classification === "BP_ON_BP"
  );
  const bpOnBpOverrideMonthly = bpOnBpEvents.reduce(
    (sum, e) => sum + e.monthlyIncomeToParent,
    0
  );

  // 4. Total Monthly Income
  const totalMonthlyIncome =
    personalCommissionMonthly + directBpOverrideMonthly + bpOnBpOverrideMonthly;

  // 5. Total Organization ALP (Personal + all people's ALP)
  const totalOrganizationAlp = alpEvents.reduce((sum, e) => sum + e.amount, 0);

  // 6. Qualification ALP (events tagged as isInitialQualification)
  const qualificationAlp = alpEvents
    .filter((e) => e.isInitialQualification)
    .reduce((sum, e) => sum + e.amount, 0);

  // Group child breakdowns
  const directBpByChild = new Map<
    string,
    { childId: string; childName: string; eligibleAlp: number; monthly: number }
  >();
  directBpEvents.forEach((e) => {
    const existing = directBpByChild.get(e.personId) || {
      childId: e.personId,
      childName: peopleMap.get(e.personId)?.name || e.personId,
      eligibleAlp: 0,
      monthly: 0,
    };
    existing.eligibleAlp += e.amount;
    existing.monthly += e.monthlyIncomeToParent;
    directBpByChild.set(e.personId, existing);
  });

  const bpOnBpByChild = new Map<
    string,
    { childId: string; childName: string; eligibleAlp: number; monthly: number }
  >();
  bpOnBpEvents.forEach((e) => {
    const existing = bpOnBpByChild.get(e.personId) || {
      childId: e.personId,
      childName: peopleMap.get(e.personId)?.name || e.personId,
      eligibleAlp: 0,
      monthly: 0,
    };
    existing.eligibleAlp += e.amount;
    existing.monthly += e.monthlyIncomeToParent;
    bpOnBpByChild.set(e.personId, existing);
  });

  const noOverrideEvents = alpEvents.filter(
    (e) => directChildIds.has(e.personId) && e.classification === "NO_OVERRIDE"
  );
  const noOverrideByChild = new Map<
    string,
    { childId: string; childName: string; alp: number; reason: string }
  >();
  noOverrideEvents.forEach((e) => {
    const existing = noOverrideByChild.get(e.personId) || {
      childId: e.personId,
      childName: peopleMap.get(e.personId)?.name || e.personId,
      alp: 0,
      reason: "Upline masih berstatus BE saat ALP dihasilkan (0% OR)",
    };
    existing.alp += e.amount;
    noOverrideByChild.set(e.personId, existing);
  });

  const directBpBreakdown = Array.from(directBpByChild.values()).map((item) => ({
    childId: item.childId,
    childName: item.childName,
    eligibleAlp: item.eligibleAlp,
    rate: rules.directBpOverrideRate,
    monthly: item.monthly,
    formula: `${formatCurrency(item.eligibleAlp)} × ${(rules.directBpOverrideRate * 100).toFixed(4).replace(".", ",")}% ÷ 12 = ${formatCurrency(item.monthly)}/bulan`,
  }));

  const bpOnBpBreakdown = Array.from(bpOnBpByChild.values()).map((item) => ({
    childId: item.childId,
    childName: item.childName,
    eligibleAlp: item.eligibleAlp,
    rate: rules.bpOnBpRate,
    monthly: item.monthly,
    formula: `${formatCurrency(item.eligibleAlp)} × ${(rules.bpOnBpRate * 100).toFixed(2).replace(".", ",")}% ÷ 12 = ${formatCurrency(item.monthly)}/bulan`,
  }));

  const noOverrideBreakdown = Array.from(noOverrideByChild.values());

  const personalFormula = `${formatCurrency(mainPersonalAlp)} × ${(rules.personalCommissionRate * 100).toFixed(2).replace(".", ",")}% ÷ 12 = ${formatCurrency(personalCommissionMonthly)}/bulan`;

  return {
    mainPersonStatus: mainStatus,
    personalAlp: mainPersonalAlp,
    qualificationAlp,
    totalOrganizationAlp,
    personalCommissionMonthly,
    directBpOverrideMonthly,
    bpOnBpOverrideMonthly,
    totalMonthlyIncome,
    breakdown: {
      personal: {
        alp: mainPersonalAlp,
        rate: rules.personalCommissionRate,
        monthly: personalCommissionMonthly,
        formula: personalFormula,
      },
      directBp: directBpBreakdown,
      bpOnBp: bpOnBpBreakdown,
      noOverride: noOverrideBreakdown,
    },
  };
}
