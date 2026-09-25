"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  SimulationScenario,
  ScenarioIncomeSummary,
  OrganizationNode,
  QualificationScheme,
  AlpEvent,
  PromotionEvent,
  Person,
} from "../lib/business/types";
import {
  loadAllScenarios,
  saveAllScenarios,
  getActiveScenarioId,
  setActiveScenarioId,
  resetScenariosToDefault,
} from "../lib/storage/scenarioStore";
import {
  calculateScenarioIncome,
  buildOrganizationTree,
  createInitialSchemeData,
  ContributorInput,
  splitAndClassifyAlpTransaction,
  getPersonCurrentStatus,
  getPersonPersonalAlp,
  BusinessRulesConfig,
  DEFAULT_BUSINESS_RULES,
} from "../lib/business";

interface SimulatorContextType {
  scenarios: SimulationScenario[];
  activeScenario: SimulationScenario;
  activeScenarioId: string;
  incomeSummary: ScenarioIncomeSummary;
  organizationTree: OrganizationNode | null;
  rules: BusinessRulesConfig;

  // Actions
  switchScenario: (id: string) => void;
  createNewScenario: (name: string, scheme: QualificationScheme) => void;
  duplicateCurrentScenario: (customName?: string) => void;
  renameScenario: (id: string, newName: string) => void;
  deleteScenario: (id: string) => void;
  resetAllToDefault: () => void;

  // Simulation operations
  updateSchemeSelection: (
    scheme: QualificationScheme,
    mainName?: string,
    customInputs?: { mainAlp?: number; contributors?: ContributorInput[] }
  ) => void;

  addPersonalAlp: (amount: number, date?: string, description?: string) => void;

  addDownlineProduction: (
    childId: string,
    additionalAlp: number,
    date?: string,
    description?: string
  ) => void;

  addNewDownlinePerson: (name: string, startingAlp?: number) => void;

  updateRules: (newRules: BusinessRulesConfig) => void;
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const loaded = loadAllScenarios();
    const active = getActiveScenarioId();
    setScenarios(loaded);
    setActiveId(active && loaded.some((s) => s.id === active) ? active : loaded[0]?.id || "");
    setIsLoaded(true);
  }, []);

  const activeScenario =
    scenarios.find((s) => s.id === activeId) || scenarios[0] || null;

  // Persist scenarios when changed
  const updateScenariosState = (newScenarios: SimulationScenario[]) => {
    setScenarios(newScenarios);
    saveAllScenarios(newScenarios);
  };

  const switchScenario = (id: string) => {
    setActiveId(id);
    setActiveScenarioId(id);
  };

  const createNewScenario = (name: string, scheme: QualificationScheme) => {
    const id = `scenario-${Date.now()}`;
    const initialData = createInitialSchemeData(scheme, "Saya");

    const newScenario: SimulationScenario = {
      id,
      name,
      rules: activeScenario?.rules || DEFAULT_BUSINESS_RULES,
      mainPerson: initialData.mainPerson,
      people: initialData.people,
      alpEvents: initialData.alpEvents,
      promotionEvents: initialData.promotionEvents,
      selectedScheme: scheme,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...scenarios, newScenario];
    updateScenariosState(updated);
    switchScenario(id);
  };

  const duplicateCurrentScenario = (customName?: string) => {
    if (!activeScenario) return;
    const id = `scenario-${Date.now()}`;
    const copy: SimulationScenario = {
      ...JSON.parse(JSON.stringify(activeScenario)),
      id,
      name: customName || `${activeScenario.name} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...scenarios, copy];
    updateScenariosState(updated);
    switchScenario(id);
  };

  const renameScenario = (id: string, newName: string) => {
    const updated = scenarios.map((s) =>
      s.id === id ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s
    );
    updateScenariosState(updated);
  };

  const deleteScenario = (id: string) => {
    if (scenarios.length <= 1) return; // Prevent deleting the last scenario
    const updated = scenarios.filter((s) => s.id !== id);
    updateScenariosState(updated);
    if (activeId === id) {
      switchScenario(updated[0].id);
    }
  };

  const resetAllToDefault = () => {
    const defaults = resetScenariosToDefault();
    setScenarios(defaults);
    setActiveId(defaults[0].id);
  };

  const updateSchemeSelection = (
    scheme: QualificationScheme,
    mainName: string = "Saya",
    customInputs?: { mainAlp?: number; contributors?: ContributorInput[] }
  ) => {
    if (!activeScenario) return;
    const initialData = createInitialSchemeData(
      scheme,
      mainName,
      customInputs,
      activeScenario.rules
    );

    const updatedActive: SimulationScenario = {
      ...activeScenario,
      mainPerson: initialData.mainPerson,
      people: initialData.people,
      alpEvents: initialData.alpEvents,
      promotionEvents: initialData.promotionEvents,
      selectedScheme: scheme,
      updatedAt: new Date().toISOString(),
    };

    const updated = scenarios.map((s) => (s.id === activeId ? updatedActive : s));
    updateScenariosState(updated);
  };

  const addPersonalAlp = (amount: number, date?: string, description?: string) => {
    if (!activeScenario || amount <= 0) return;
    const mainPersonId = activeScenario.mainPerson.id;
    const currentStatus = getPersonCurrentStatus(
      mainPersonId,
      activeScenario.people,
      activeScenario.promotionEvents
    );

    const rules = activeScenario.rules;
    const currentAlp = getPersonPersonalAlp(mainPersonId, activeScenario.alpEvents);
    const newTotal = currentAlp + amount;
    const effectiveDate = date || new Date().toISOString().slice(0, 10);

    const monthlyComm = Math.round((amount * rules.personalCommissionRate) / rules.monthsPerYear);

    const newEvent: AlpEvent = {
      id: `alp-personal-${Date.now()}`,
      personId: mainPersonId,
      amount,
      date: effectiveDate,
      description: description || `Produksi personal tambahan (${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)})`,
      producerStatusAtEvent: currentStatus,
      parentStatusAtEvent: undefined,
      classification: "PERSONAL",
      rateApplied: rules.personalCommissionRate,
      monthlyIncomeToProducer: monthlyComm,
      monthlyIncomeToParent: 0,
    };

    const newPromotionEvents = [...activeScenario.promotionEvents];
    // Check if main person qualifies to BP purely from personal production if not yet BP
    if (currentStatus === "BE" && newTotal >= rules.bpQualificationALP) {
      newPromotionEvents.push({
        id: `promo-main-bp-${Date.now()}`,
        personId: mainPersonId,
        from: "BE",
        to: "BP",
        date: effectiveDate,
        triggerAlpTotal: newTotal,
        notes: "Mencapai kualifikasi BP melalui produksi personal akumulatif.",
      });
    }

    const updatedActive: SimulationScenario = {
      ...activeScenario,
      alpEvents: [...activeScenario.alpEvents, newEvent],
      promotionEvents: newPromotionEvents,
      updatedAt: new Date().toISOString(),
    };

    const updated = scenarios.map((s) => (s.id === activeId ? updatedActive : s));
    updateScenariosState(updated);
  };

  const addDownlineProduction = (
    childId: string,
    additionalAlp: number,
    date?: string,
    description?: string
  ) => {
    if (!activeScenario || additionalAlp <= 0) return;
    const rules = activeScenario.rules;
    const parentId = activeScenario.mainPerson.id;

    // Snapshot status of parent and child at this moment!
    const parentStatus = getPersonCurrentStatus(
      parentId,
      activeScenario.people,
      activeScenario.promotionEvents
    );
    const currentChildAlp = getPersonPersonalAlp(childId, activeScenario.alpEvents);
    const effectiveDate = date || new Date().toISOString().slice(0, 10);
    const childPerson = activeScenario.people.find((p) => p.id === childId);
    const childName = childPerson?.name || "Mitra";

    // Split and classify into immutable tranches
    const tranches = splitAndClassifyAlpTransaction(
      currentChildAlp,
      additionalAlp,
      parentStatus,
      rules
    );

    const newAlpEvents: AlpEvent[] = tranches.map((t, idx) => ({
      id: `alp-downline-${childId}-${Date.now()}-${idx}`,
      personId: childId,
      amount: t.amount,
      date: effectiveDate,
      description:
        description ||
        `Produksi ${childName} (${t.amount >= 1_000_000 ? `${t.amount / 1_000_000} jt` : t.amount}) [${t.classification}]`,
      producerStatusAtEvent: t.producerStatusAtEvent,
      parentStatusAtEvent: t.parentStatusAtEvent,
      classification: t.classification,
      rateApplied: t.rateAppliedToParent,
      monthlyIncomeToProducer: t.monthlyIncomeToProducer,
      monthlyIncomeToParent: t.monthlyIncomeToParent,
      formulaExplanation: t.explanation,
    }));

    const newPromotionEvents = [...activeScenario.promotionEvents];
    const willPromote = tranches.some((t) => t.triggersPromotion);
    const isChildAlreadyBp = newPromotionEvents.some(
      (p) => p.personId === childId && p.to === "BP"
    );

    if (willPromote && !isChildAlreadyBp) {
      newPromotionEvents.push({
        id: `promo-${childId}-bp-${Date.now()}`,
        personId: childId,
        from: "BE",
        to: "BP",
        date: effectiveDate,
        triggerAlpTotal: currentChildAlp + additionalAlp,
        notes: `${childName} resmi promosi ke BP saat kumulatif ALP mencapai Rp300jt.`,
      });
    }

    const updatedActive: SimulationScenario = {
      ...activeScenario,
      alpEvents: [...activeScenario.alpEvents, ...newAlpEvents],
      promotionEvents: newPromotionEvents,
      updatedAt: new Date().toISOString(),
    };

    const updated = scenarios.map((s) => (s.id === activeId ? updatedActive : s));
    updateScenariosState(updated);
  };

  const addNewDownlinePerson = (name: string, startingAlp: number = 0) => {
    if (!activeScenario || !name.trim()) return;
    const newPersonId = `person-child-${Date.now()}`;
    const newPerson: Person = {
      id: newPersonId,
      name: name.trim(),
      parentId: activeScenario.mainPerson.id,
      initialStatus: "BE",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updatedPeople = [...activeScenario.people, newPerson];
    const updatedActive: SimulationScenario = {
      ...activeScenario,
      people: updatedPeople,
      updatedAt: new Date().toISOString(),
    };

    const updated = scenarios.map((s) => (s.id === activeId ? updatedActive : s));
    updateScenariosState(updated);

    if (startingAlp > 0) {
      addDownlineProduction(newPersonId, startingAlp);
    }
  };

  const updateRules = (newRules: BusinessRulesConfig) => {
    if (!activeScenario) return;
    const updatedActive: SimulationScenario = {
      ...activeScenario,
      rules: newRules,
      updatedAt: new Date().toISOString(),
    };
    const updated = scenarios.map((s) => (s.id === activeId ? updatedActive : s));
    updateScenariosState(updated);
  };

  // Safe fallback while loading
  if (!isLoaded || !activeScenario) {
    return null;
  }

  const incomeSummary = calculateScenarioIncome(
    activeScenario.mainPerson.id,
    activeScenario.people,
    activeScenario.alpEvents,
    activeScenario.promotionEvents,
    activeScenario.rules
  );

  const organizationTree = buildOrganizationTree(
    activeScenario.mainPerson.id,
    activeScenario.people,
    activeScenario.alpEvents,
    activeScenario.promotionEvents
  );

  return (
    <SimulatorContext.Provider
      value={{
        scenarios,
        activeScenario,
        activeScenarioId: activeId,
        incomeSummary,
        organizationTree,
        rules: activeScenario.rules,
        switchScenario,
        createNewScenario,
        duplicateCurrentScenario,
        renameScenario,
        deleteScenario,
        resetAllToDefault,
        updateSchemeSelection,
        addPersonalAlp,
        addDownlineProduction,
        addNewDownlinePerson,
        updateRules,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error("useSimulator must be used within a SimulatorProvider");
  }
  return context;
}
