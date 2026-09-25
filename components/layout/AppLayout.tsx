"use client";

import React, { useState } from "react";
import { useSimulator } from "../SimulatorContext";
import { formatCompactRupiah, formatRupiah } from "../../lib/utils/currency";
import { SaveScenarioModal } from "../scenarios/SaveScenarioModal";
import {
  LayoutDashboard,
  Calculator,
  Users,
  Clock,
  Layers,
  BookOpen,
  Menu,
  X,
  ShieldCheck,
  Plus,
  Coins,
  ChevronDown,
  Save,
  Sparkles,
} from "lucide-react";

export type ActiveTab =
  | "dashboard"
  | "simulator"
  | "organization"
  | "timeline"
  | "scenarios"
  | "rules";

interface AppLayoutProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const {
    scenarios,
    activeScenarioId,
    activeScenario,
    switchScenario,
    startFreshScenario,
    incomeSummary,
  } = useSimulator();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "simulator" as const, label: "Simulator", icon: Calculator },
    { id: "organization" as const, label: "Organisasi", icon: Users },
    { id: "timeline" as const, label: "Timeline", icon: Clock },
    { id: "scenarios" as const, label: "Skenario", icon: Layers },
    { id: "rules" as const, label: "Aturan Perhitungan", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                A
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 block leading-tight">
                  SIMULATOR BISNIS
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Kompensasi Agensi Asuransi
                </span>
              </div>
            </div>
          </div>

          {/* Active Scenario Selector & Quick Stats */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Actions */}
            <button
              onClick={() => {
                startFreshScenario();
                setActiveTab("simulator");
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              title="Mulai simulasi agen baru dari nol"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Dari Nol</span>
            </button>

            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold transition-colors"
              title="Simpan perubahan skenario"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>

            {/* Scenario Dropdown */}
            <div className="relative">
              <select
                value={activeScenarioId}
                onChange={(e) => switchScenario(e.target.value)}
                className="appearance-none bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-200 cursor-pointer max-w-[130px] sm:max-w-[200px] truncate"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Pill */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
              <span className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 text-[11px] ${
                incomeSummary.mainPersonStatus === "BP"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-sky-100 text-sky-700"
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {incomeSummary.mainPersonStatus}
              </span>
              <span className="font-bold text-slate-800 text-xs">
                {formatCompactRupiah(incomeSummary.totalMonthlyIncome)}/bln
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 space-y-6">
          <nav className="space-y-1 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-sky-600 text-white shadow-sm shadow-sky-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Context Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ringkasan Penghasilan
            </span>
            <div className="font-extrabold text-slate-900 text-base">
              {formatRupiah(incomeSummary.totalMonthlyIncome)}
              <span className="text-[11px] font-normal text-slate-500"> /bln</span>
            </div>
            <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Komisi Personal:</span>
                <span className="font-semibold text-emerald-700">{formatCompactRupiah(incomeSummary.personalCommissionMonthly)}</span>
              </div>
              <div className="flex justify-between">
                <span>Direct BP OR:</span>
                <span className="font-semibold text-sky-700">{formatCompactRupiah(incomeSummary.directBpOverrideMonthly)}</span>
              </div>
              <div className="flex justify-between">
                <span>BP-on-BP OR:</span>
                <span className="font-semibold text-purple-700">{formatCompactRupiah(incomeSummary.bpOnBpOverrideMonthly)}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden bg-slate-900/40 backdrop-blur-xs flex">
            <div className="w-64 bg-white h-full p-4 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-800">Menu Navigasi</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                          isActive
                            ? "bg-sky-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                Simulator Kompensasi Agensi Asuransi v1.0
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? "text-sky-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      <SaveScenarioModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        defaultMode="save_current"
      />
    </div>
  );
};
