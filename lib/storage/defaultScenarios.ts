import { SimulationScenario } from "../business/types";
import { DEFAULT_BUSINESS_RULES } from "../business/rules";
import { createInitialSchemeData } from "../business/calculateQualification";
import { AlpEvent, PromotionEvent } from "../business/types";

export function createDefaultScenarios(): SimulationScenario[] {
  // 1. Mandatory Acceptance Test Scenario (Section 9)
  const scheme3Data = createInitialSchemeData("SCHEME_3", "Saya");
  const personA = scheme3Data.people.find((p) => p.name.includes("A"))!;

  // Step 2 of acceptance scenario: A grows 100m -> 300m (+200m)
  const eventStep2: AlpEvent = {
    id: "alp-a-200m-direct-or",
    personId: personA.id,
    amount: 200_000_000,
    date: "2026-03-01",
    description: "Mitra A bertumbuh dari 100jt ke 300jt (Direct BP OR)",
    producerStatusAtEvent: "BE",
    parentStatusAtEvent: "BP",
    classification: "DIRECT_BP_OVERRIDE",
    rateApplied: DEFAULT_BUSINESS_RULES.directBpOverrideRate,
    monthlyIncomeToProducer: Math.round((200_000_000 * DEFAULT_BUSINESS_RULES.personalCommissionRate) / 12),
    monthlyIncomeToParent: Math.round((200_000_000 * DEFAULT_BUSINESS_RULES.directBpOverrideRate) / 12),
    formulaExplanation: `Rp 200.000.000 × 12,7875% ÷ 12 = Rp 2.131.250/bulan`,
  };

  const promoA: PromotionEvent = {
    id: "promo-mitra-a-bp",
    personId: personA.id,
    from: "BE",
    to: "BP",
    date: "2026-03-01",
    triggerAlpTotal: 300_000_000,
    notes: "Mitra A resmi promosi ke BP saat kumulatif ALP mencapai Rp300jt.",
  };

  // Step 3 of acceptance scenario: A grows 300m -> 400m (+100m post-BP)
  const eventStep3: AlpEvent = {
    id: "alp-a-100m-bp-on-bp",
    personId: personA.id,
    amount: 100_000_000,
    date: "2026-06-01",
    description: "Mitra A bertumbuh dari 300jt ke 400jt setelah menjadi BP (BP-on-BP OR)",
    producerStatusAtEvent: "BP",
    parentStatusAtEvent: "BP",
    classification: "BP_ON_BP",
    rateApplied: DEFAULT_BUSINESS_RULES.bpOnBpRate,
    monthlyIncomeToProducer: Math.round((100_000_000 * DEFAULT_BUSINESS_RULES.personalCommissionRate) / 12),
    monthlyIncomeToParent: Math.round((100_000_000 * DEFAULT_BUSINESS_RULES.bpOnBpRate) / 12),
    formulaExplanation: `Rp 100.000.000 × 4,65% ÷ 12 = Rp 387.500/bulan`,
  };

  const scenarioStandard: SimulationScenario = {
    id: "scenario-standard-scheme-3",
    name: "Skenario Standar (Skema 3 + Pertumbuhan)",
    description: "Simulasi wajib: Kualifikasi Skema 3 (100+100+100), lalu Mitra A tumbuh ke 300jt (Direct OR) dan 400jt (BP-on-BP).",
    rules: DEFAULT_BUSINESS_RULES,
    mainPerson: scheme3Data.mainPerson,
    people: scheme3Data.people,
    alpEvents: [...scheme3Data.alpEvents, eventStep2, eventStep3],
    promotionEvents: [...scheme3Data.promotionEvents, promoA],
    selectedScheme: "SCHEME_3",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  };

  // 2. Scheme 1 (Full Personal)
  const scheme1Data = createInitialSchemeData("SCHEME_1", "Saya");
  const scenarioScheme1: SimulationScenario = {
    id: "scenario-scheme-1-personal",
    name: "Skenario 1 (Fokus Personal 300 Jt)",
    description: "Kualifikasi BP mandiri 100% dengan produksi personal Rp300 juta.",
    rules: DEFAULT_BUSINESS_RULES,
    mainPerson: scheme1Data.mainPerson,
    people: scheme1Data.people,
    alpEvents: scheme1Data.alpEvents,
    promotionEvents: scheme1Data.promotionEvents,
    selectedScheme: "SCHEME_1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  // 3. Scheme 4 (Keroyokan Fleksibel)
  const scheme4Data = createInitialSchemeData("SCHEME_4", "Saya");
  const scenarioScheme4: SimulationScenario = {
    id: "scenario-scheme-4-keroyokan",
    name: "Skenario 4 (Keroyokan / Fleksibel)",
    description: "Kualifikasi bersama 4 kontributor (30jt + 20jt + 50jt + 100jt) ditambah 100jt personal.",
    rules: DEFAULT_BUSINESS_RULES,
    mainPerson: scheme4Data.mainPerson,
    people: scheme4Data.people,
    alpEvents: scheme4Data.alpEvents,
    promotionEvents: scheme4Data.promotionEvents,
    selectedScheme: "SCHEME_4",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  return [scenarioStandard, scenarioScheme1, scenarioScheme4];
}
