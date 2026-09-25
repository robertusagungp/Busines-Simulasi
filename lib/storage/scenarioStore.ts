import { SimulationScenario } from "../business/types";
import { createDefaultScenarios } from "./defaultScenarios";

const STORAGE_KEY = "insurance_simulator_scenarios_v1";
const ACTIVE_SCENARIO_ID_KEY = "insurance_simulator_active_id_v1";

export function loadAllScenarios(): SimulationScenario[] {
  if (typeof window === "undefined") {
    return createDefaultScenarios();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = createDefaultScenarios();
      saveAllScenarios(defaults);
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const defaults = createDefaultScenarios();
      saveAllScenarios(defaults);
      return defaults;
    }
    return parsed;
  } catch (err) {
    console.error("Gagal memuat skenario dari localStorage:", err);
    return createDefaultScenarios();
  }
}

export function saveAllScenarios(scenarios: SimulationScenario[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch (err) {
    console.error("Gagal menyimpan skenario ke localStorage:", err);
  }
}

export function getActiveScenarioId(): string {
  if (typeof window === "undefined") {
    return "scenario-standard-scheme-3";
  }
  try {
    const active = localStorage.getItem(ACTIVE_SCENARIO_ID_KEY);
    return active || "scenario-standard-scheme-3";
  } catch {
    return "scenario-standard-scheme-3";
  }
}

export function setActiveScenarioId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_SCENARIO_ID_KEY, id);
  } catch (err) {
    console.error("Gagal menyimpan active scenario ID:", err);
  }
}

export function resetScenariosToDefault(): SimulationScenario[] {
  const defaults = createDefaultScenarios();
  saveAllScenarios(defaults);
  setActiveScenarioId(defaults[0].id);
  return defaults;
}
