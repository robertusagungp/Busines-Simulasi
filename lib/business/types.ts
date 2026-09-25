import { BusinessRulesConfig } from "./rules";

export type PersonStatus = "BE" | "BP";

export type QualificationScheme =
  | "SCHEME_1" // 300jt Sendiri
  | "SCHEME_2" // 200jt + 50jt + 50jt (min 50jt/orang)
  | "SCHEME_3" // 100jt + 100jt + 100jt
  | "SCHEME_4"; // Fleksibel / Keroyokan

export type AlpClassification =
  | "PERSONAL"
  | "QUALIFICATION"
  | "NO_OVERRIDE"
  | "DIRECT_BP_OVERRIDE"
  | "BP_ON_BP";

export interface Person {
  id: string;
  name: string;
  parentId?: string;
  initialStatus?: PersonStatus;
  createdAt: string;
}

export interface AlpEvent {
  id: string;
  personId: string;
  amount: number;
  date: string;
  description?: string;
  isInitialQualification?: boolean;
  qualificationScheme?: QualificationScheme;

  // Snapshot context at the time the ALP was generated
  producerStatusAtEvent: PersonStatus;
  parentStatusAtEvent?: PersonStatus;

  classification: AlpClassification;
  rateApplied: number;
  monthlyIncomeToParent: number;
  monthlyIncomeToProducer: number;

  formulaExplanation?: string;
}

export interface PromotionEvent {
  id: string;
  personId: string;
  from: "BE";
  to: "BP";
  date: string;
  triggerAlpTotal: number;
  schemeUsed?: QualificationScheme;
  notes?: string;
}

export interface PersonIncomeSummary {
  personId: string;
  personName: string;
  status: PersonStatus;
  isMainPerson: boolean;
  personalAlp: number;
  totalTeamAlp: number; // Downline total ALP
  cumulativeAlp: number; // personal + downline
  qualificationAlp: number; // Contribution to BP qualification

  personalCommissionMonthly: number;
  directBpOverrideMonthly: number;
  bpOnBpOverrideMonthly: number;
  totalMonthlyIncome: number;

  // Tranches breakdown for audit
  personalEventsCount: number;
  overridingEventsCount: number;
}

export interface OrganizationNode {
  person: Person;
  status: PersonStatus;
  promotedAt?: string;
  personalAlp: number;
  teamAlp: number;
  cumulativeAlp: number;
  children: OrganizationNode[];
  incomeGeneratedForParent: {
    noOverrideAlp: number;
    directBpAlp: number;
    bpOnBpAlp: number;
    directBpMonthly: number;
    bpOnBpMonthly: number;
  };
}

export interface ScenarioIncomeSummary {
  mainPersonStatus: PersonStatus;
  personalAlp: number;
  qualificationAlp: number;
  totalOrganizationAlp: number;

  personalCommissionMonthly: number;
  directBpOverrideMonthly: number;
  bpOnBpOverrideMonthly: number;
  totalMonthlyIncome: number;

  // Detailed breakdown items
  breakdown: {
    personal: {
      alp: number;
      rate: number;
      monthly: number;
      formula: string;
    };
    directBp: Array<{
      childId: string;
      childName: string;
      eligibleAlp: number;
      rate: number;
      monthly: number;
      formula: string;
    }>;
    bpOnBp: Array<{
      childId: string;
      childName: string;
      eligibleAlp: number;
      rate: number;
      monthly: number;
      formula: string;
    }>;
    noOverride: Array<{
      childId: string;
      childName: string;
      alp: number;
      reason: string;
    }>;
  };
}

export interface SimulationScenario {
  id: string;
  name: string;
  description?: string;
  rules: BusinessRulesConfig;
  mainPerson: Person;
  people: Person[];
  alpEvents: AlpEvent[];
  promotionEvents: PromotionEvent[];
  selectedScheme?: QualificationScheme;
  createdAt: string;
  updatedAt: string;
}
