import { BusinessRulesConfig, DEFAULT_BUSINESS_RULES } from "./rules";
import { Person, AlpEvent, PromotionEvent, QualificationScheme } from "./types";

export interface ContributorInput {
  name: string;
  alp: number;
}

export interface SchemeValidationResult {
  isValid: boolean;
  isQualifiedBp: boolean;
  canProceed: boolean;
  totalQualificationAlp: number;
  percentage: number;
  message?: string;
  contributorErrors?: Record<number, string>;
  mainError?: string;
}

export function validateQualificationScheme(
  scheme: QualificationScheme,
  mainAlp: number,
  contributors: ContributorInput[] = [],
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): SchemeValidationResult {
  const threshold = rules.bpQualificationALP;
  const contributorTotal = contributors.reduce((sum, c) => sum + (c.alp || 0), 0);
  const totalAlp = (mainAlp || 0) + contributorTotal;
  const percentage = Math.min(100, Number(((totalAlp / threshold) * 100).toFixed(1)));
  const isQualifiedBp = totalAlp >= threshold;

  const contributorErrors: Record<number, string> = {};
  let mainError: string | undefined;

  switch (scheme) {
    case "SCHEME_CUSTOM": {
      return {
        isValid: isQualifiedBp,
        isQualifiedBp,
        canProceed: true, // Always allow proceeding to simulate the journey
        totalQualificationAlp: totalAlp,
        percentage,
        message: isQualifiedBp
          ? `🎉 Memenuhi target kualifikasi BP (${formatIdr(totalAlp)}). Siap promosi menjadi BP!`
          : `Status saat ini: BE. Terkumpul ${formatIdr(totalAlp)} dari target ${formatIdr(threshold)} (Kurang ${formatIdr(threshold - totalAlp)}).`,
      };
    }

    case "SCHEME_1": {
      if (mainAlp < threshold) {
        mainError = `Skema 1 memerlukan ${formatIdr(threshold)} produksi personal. Terisi ${formatIdr(mainAlp)}.`;
        return {
          isValid: false,
          isQualifiedBp: false,
          canProceed: true, // Allow proceeding as BE if user wants to start small
          totalQualificationAlp: totalAlp,
          percentage,
          mainError,
          message: `Status saat ini: BE (${formatIdr(mainAlp)} / ${formatIdr(threshold)}). Tambah produksi untuk kualifikasi BP.`,
        };
      }
      return {
        isValid: true,
        isQualifiedBp: true,
        canProceed: true,
        totalQualificationAlp: totalAlp,
        percentage: 100,
        message: "Memenuhi kualifikasi BP (Skema 1: Full Personal).",
      };
    }

    case "SCHEME_2": {
      let valid = true;
      if (mainAlp < 200_000_000) {
        mainError = "Produksi personal utama minimal Rp200 juta untuk Skema 2 standar.";
        valid = false;
      }
      if (contributors.length < 2) {
        valid = false;
      }

      contributors.forEach((c, idx) => {
        if ((c.alp || 0) < rules.scheme2MinContributorALP) {
          contributorErrors[idx] = `Kontribusi minimum skema ini adalah ${formatIdr(rules.scheme2MinContributorALP)}/orang.`;
          valid = false;
        }
      });

      return {
        isValid: valid && isQualifiedBp,
        isQualifiedBp,
        canProceed: true,
        totalQualificationAlp: totalAlp,
        percentage,
        mainError,
        contributorErrors,
        message:
          valid && isQualifiedBp
            ? "Memenuhi kualifikasi BP (Skema 2: 200jt + 50jt + 50jt)."
            : isQualifiedBp
            ? "Total mencapai Rp300jt, namun distribusi belum sesuai standar Skema 2."
            : `Total kualifikasi baru ${formatIdr(totalAlp)} dari target ${formatIdr(threshold)}.`,
      };
    }

    case "SCHEME_3": {
      let valid = true;
      if (mainAlp < 100_000_000) {
        mainError = "Produksi personal utama minimal Rp100 juta untuk Skema 3 standar.";
        valid = false;
      }
      if (contributors.length < 2) {
        valid = false;
      }

      contributors.forEach((c, idx) => {
        if ((c.alp || 0) < 100_000_000) {
          contributorErrors[idx] = "Kontribusi kontributor minimal Rp100 juta untuk Skema 3.";
          valid = false;
        }
      });

      return {
        isValid: valid && isQualifiedBp,
        isQualifiedBp,
        canProceed: true,
        totalQualificationAlp: totalAlp,
        percentage,
        mainError,
        contributorErrors,
        message:
          valid && isQualifiedBp
            ? "Memenuhi kualifikasi BP (Skema 3: 100jt + 100jt + 100jt)."
            : `Total kualifikasi ${formatIdr(totalAlp)} dari target ${formatIdr(threshold)}.`,
      };
    }

    case "SCHEME_4": {
      return {
        isValid: isQualifiedBp,
        isQualifiedBp,
        canProceed: true,
        totalQualificationAlp: totalAlp,
        percentage,
        message: isQualifiedBp
          ? "Memenuhi kualifikasi BP (Skema 4: Keroyokan / Fleksibel)."
          : `Total kualifikasi baru ${formatIdr(totalAlp)} dari target ${formatIdr(threshold)}.`,
      };
    }

    default:
      return {
        isValid: isQualifiedBp,
        isQualifiedBp,
        canProceed: true,
        totalQualificationAlp: totalAlp,
        percentage,
      };
  }
}

/**
 * Initializes a new simulation scenario for a given qualification scheme.
 * Creates the initial people and historical immutable ALP events.
 * Crucial rule: At the moment these qualification events occurred, Main person was BE!
 * Therefore, Main person earns NO OVERRIDING from contributors' initial qualification ALP!
 */
export function createInitialSchemeData(
  scheme: QualificationScheme,
  mainName: string = "Saya",
  customInputs?: { mainAlp?: number; contributors?: ContributorInput[] },
  rules: BusinessRulesConfig = DEFAULT_BUSINESS_RULES
): {
  mainPerson: Person;
  people: Person[];
  alpEvents: AlpEvent[];
  promotionEvents: PromotionEvent[];
} {
  const mainPersonId = "person-main";
  const mainPerson: Person = {
    id: mainPersonId,
    name: mainName,
    initialStatus: "BE",
    createdAt: "2026-01-01",
  };

  const people: Person[] = [mainPerson];
  const alpEvents: AlpEvent[] = [];
  const promotionEvents: PromotionEvent[] = [];

  let mainAlp = 0;
  let contributorsData: ContributorInput[] = [];

  if (scheme === "SCHEME_CUSTOM") {
    mainAlp = customInputs?.mainAlp ?? 0;
    contributorsData = customInputs?.contributors ?? [];
  } else if (scheme === "SCHEME_1") {
    mainAlp = customInputs?.mainAlp ?? 300_000_000;
  } else if (scheme === "SCHEME_2") {
    mainAlp = customInputs?.mainAlp ?? 200_000_000;
    contributorsData = customInputs?.contributors ?? [
      { name: "Mitra A", alp: 50_000_000 },
      { name: "Mitra B", alp: 50_000_000 },
    ];
  } else if (scheme === "SCHEME_3") {
    mainAlp = customInputs?.mainAlp ?? 100_000_000;
    contributorsData = customInputs?.contributors ?? [
      { name: "Mitra A", alp: 100_000_000 },
      { name: "Mitra B", alp: 100_000_000 },
    ];
  } else if (scheme === "SCHEME_4") {
    mainAlp = customInputs?.mainAlp ?? 100_000_000;
    contributorsData = customInputs?.contributors ?? [
      { name: "Mitra A", alp: 30_000_000 },
      { name: "Mitra B", alp: 20_000_000 },
      { name: "Mitra C", alp: 50_000_000 },
      { name: "Mitra D", alp: 100_000_000 },
    ];
  }

  // 1. Record Main Person's initial ALP event
  if (mainAlp > 0) {
    const monthlyPersonalCommission = (mainAlp * rules.personalCommissionRate) / rules.monthsPerYear;
    alpEvents.push({
      id: `alp-main-init`,
      personId: mainPersonId,
      amount: mainAlp,
      date: "2026-01-01",
      description: `Produksi personal awal (${scheme})`,
      isInitialQualification: true,
      qualificationScheme: scheme,
      producerStatusAtEvent: "BE",
      parentStatusAtEvent: undefined,
      classification: "PERSONAL",
      rateApplied: rules.personalCommissionRate,
      monthlyIncomeToProducer: monthlyPersonalCommission,
      monthlyIncomeToParent: 0,
      formulaExplanation: `${formatIdr(mainAlp)} × ${(rules.personalCommissionRate * 100).toFixed(2).replace(".", ",")}% ÷ 12 = ${formatIdr(monthlyPersonalCommission)}/bulan`,
    });
  }

  // 2. Add Contributors and their initial qualification ALP events
  let contributorTotalAlp = 0;
  contributorsData.forEach((c, index) => {
    const childId = `person-child-${index + 1}`;
    const childPerson: Person = {
      id: childId,
      name: c.name,
      parentId: mainPersonId,
      initialStatus: "BE",
      createdAt: "2026-01-15",
    };
    people.push(childPerson);

    const childMonthlyCommission = (c.alp * rules.personalCommissionRate) / rules.monthsPerYear;
    contributorTotalAlp += c.alp;

    // IMMUTABLE RULE: When contributor produced this initial ALP, Main was STILL BE!
    // Therefore: classification = NO_OVERRIDE, rate to parent = 0, income to parent = 0!
    alpEvents.push({
      id: `alp-init-${childId}`,
      personId: childId,
      amount: c.alp,
      date: "2026-01-15",
      description: `Kontribusi kualifikasi BP untuk ${mainName} (${scheme})`,
      isInitialQualification: true,
      qualificationScheme: scheme,
      producerStatusAtEvent: "BE",
      parentStatusAtEvent: "BE", // Main was still BE!
      classification: "NO_OVERRIDE",
      rateApplied: 0,
      monthlyIncomeToProducer: childMonthlyCommission,
      monthlyIncomeToParent: 0, // Rp 0 overriding
      formulaExplanation: `Upline (${mainName}) masih BE saat transaksi ini terjadi. Tidak ada overriding (0%). Komisi personal masuk ke ${c.name}.`,
    });
  });

  // 3. If total qualification ALP >= 300m, Main qualifies and is promoted to BP!
  const totalQualificationAlp = mainAlp + contributorTotalAlp;
  if (totalQualificationAlp >= rules.bpQualificationALP) {
    promotionEvents.push({
      id: `promo-main-bp`,
      personId: mainPersonId,
      from: "BE",
      to: "BP",
      date: "2026-02-01",
      triggerAlpTotal: totalQualificationAlp,
      schemeUsed: scheme,
      notes: `Resmi promosi ke BP via ${scheme} dengan total kualifikasi ${formatIdr(totalQualificationAlp)}.`,
    });
  }

  return {
    mainPerson,
    people,
    alpEvents,
    promotionEvents,
  };
}

function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
