"use client";

import React, { useState } from "react";
import { SimulatorProvider } from "../components/SimulatorContext";
import { AppLayout, ActiveTab } from "../components/layout/AppLayout";
import { DashboardView } from "../components/dashboard/DashboardView";
import { SimulatorWizard } from "../components/simulator/SimulatorWizard";
import { OrganizationView } from "../components/organization/OrganizationView";
import { TimelineView } from "../components/timeline/TimelineView";
import { ScenarioManagerView } from "../components/scenarios/ScenarioManagerView";
import { RulesInspectorView } from "../components/rules/RulesInspectorView";

function MainContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "dashboard" && (
        <DashboardView onNavigateTab={(tab) => setActiveTab(tab)} />
      )}
      {activeTab === "simulator" && <SimulatorWizard />}
      {activeTab === "organization" && <OrganizationView />}
      {activeTab === "timeline" && <TimelineView />}
      {activeTab === "scenarios" && <ScenarioManagerView />}
      {activeTab === "rules" && <RulesInspectorView />}
    </AppLayout>
  );
}

export default function HomePage() {
  return (
    <SimulatorProvider>
      <MainContent />
    </SimulatorProvider>
  );
}
