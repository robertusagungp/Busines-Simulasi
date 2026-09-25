"use client";

import React, { useState } from "react";
import { useSimulator } from "../SimulatorContext";
import { formatRupiah, formatCompactRupiah } from "../../lib/utils/currency";
import { IncomeBreakdownModal } from "../income/IncomeBreakdownModal";
import { AddDownlineModal } from "../simulator/AddDownlineModal";
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Wallet,
  Calculator,
  ArrowUpRight,
  Plus,
  Users,
  Coins,
  ChevronRight,
} from "lucide-react";

interface DashboardViewProps {
  onNavigateTab: (tab: "simulator" | "organization" | "timeline" | "scenarios" | "rules") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    activeScenario,
    incomeSummary,
    rules,
    addPersonalAlp,
  } = useSimulator();

  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isAddDownlineOpen, setIsAddDownlineOpen] = useState(false);
  const [isAddPersonalOpen, setIsAddPersonalOpen] = useState(false);
  const [personalInputAmt, setPersonalInputAmt] = useState<number>(50_000_000);

  const isBP = incomeSummary.mainPersonStatus === "BP";

  return (
    <div className="space-y-6">
      {/* Top Banner Status & Hero Total Income */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-sky-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isBP ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                Status Anda: {incomeSummary.mainPersonStatus}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeScenario.name}
              </span>
            </div>

            <div className="pt-1">
              <div className="text-xs text-slate-400 font-medium">
                Total Estimasi Penghasilan Bulanan
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mt-1">
                {formatRupiah(incomeSummary.totalMonthlyIncome)}
                <span className="text-base sm:text-lg font-normal text-slate-400"> / bulan</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span>Personal: <strong className="text-emerald-400">{formatRupiah(incomeSummary.personalCommissionMonthly)}</strong></span>
              <span>•</span>
              <span>Direct OR: <strong className="text-sky-300">{formatRupiah(incomeSummary.directBpOverrideMonthly)}</strong></span>
              <span>•</span>
              <span>BP-on-BP: <strong className="text-purple-300">{formatRupiah(incomeSummary.bpOnBpOverrideMonthly)}</strong></span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsBreakdownOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-sky-300" />
              <span>Lihat Rincian Rumus</span>
            </button>

            <button
              onClick={() => setIsAddDownlineOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Produksi Anak</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Metric Cards Grid (Section 12) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Status Agen */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Status Agen</span>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isBP ? "bg-purple-600" : "bg-sky-500"}`} />
            {incomeSummary.mainPersonStatus}
          </div>
          <div className="text-[11px] text-slate-500">
            {isBP ? "Business Partner" : "Business Executive"}
          </div>
        </div>

        {/* Card 2: Personal ALP */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Personal ALP</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {formatCompactRupiah(incomeSummary.personalAlp)}
          </div>
          <div className="text-[11px] text-slate-500">
            {formatRupiah(incomeSummary.personalAlp)}
          </div>
        </div>

        {/* Card 3: Kualifikasi ALP */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Kualifikasi ALP</span>
            <Award className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {formatCompactRupiah(incomeSummary.qualificationAlp)}
          </div>
          <div className="text-[11px] text-slate-500">
            Target: {formatCompactRupiah(rules.bpQualificationALP)}
          </div>
        </div>

        {/* Card 4: Total Org ALP */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Org ALP</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            {formatCompactRupiah(incomeSummary.totalOrganizationAlp)}
          </div>
          <div className="text-[11px] text-slate-500">
            Termasuk personal & downline
          </div>
        </div>

        {/* Card 5: Komisi Personal / bulan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Komisi Personal</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-700">
            {formatRupiah(incomeSummary.personalCommissionMonthly)}
          </div>
          <div className="text-[11px] text-slate-500">
            23,25% / 12 (selama 24 bln)
          </div>
        </div>

        {/* Card 6: Direct BP OR / bulan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Direct BP OR</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-lg font-bold text-sky-700">
            {formatRupiah(incomeSummary.directBpOverrideMonthly)}
          </div>
          <div className="text-[11px] text-slate-500">
            12,7875% dari mitra BE
          </div>
        </div>

        {/* Card 7: BP-on-BP OR / bulan */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>BP-on-BP OR</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-purple-700">
            {formatRupiah(incomeSummary.bpOnBpOverrideMonthly)}
          </div>
          <div className="text-[11px] text-slate-500">
            4,65% dari mitra post-BP
          </div>
        </div>

        {/* Card 8: Total Income */}
        <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-sky-800 text-xs font-medium">
            <span>Total Penghasilan</span>
            <ArrowUpRight className="w-4 h-4 text-sky-700" />
          </div>
          <div className="text-lg font-extrabold text-sky-900">
            {formatRupiah(incomeSummary.totalMonthlyIncome)}
          </div>
          <div className="text-[11px] text-sky-700">
            Per bulan akumulatif
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Income Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Komposisi Sumber Penghasilan
              </h3>
              <p className="text-xs text-slate-500">
                Porsi kontribusi dari personal dan overriding tim
              </p>
            </div>
            <button
              onClick={() => setIsBreakdownOpen(true)}
              className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
            >
              Lihat Perhitungan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Composition Progress Bar */}
          {incomeSummary.totalMonthlyIncome > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
                <div
                  className="bg-emerald-500 transition-all"
                  style={{
                    width: `${(incomeSummary.personalCommissionMonthly / incomeSummary.totalMonthlyIncome) * 100}%`,
                  }}
                  title="Komisi Personal"
                />
                <div
                  className="bg-sky-500 transition-all"
                  style={{
                    width: `${(incomeSummary.directBpOverrideMonthly / incomeSummary.totalMonthlyIncome) * 100}%`,
                  }}
                  title="Direct BP OR"
                />
                <div
                  className="bg-purple-500 transition-all"
                  style={{
                    width: `${(incomeSummary.bpOnBpOverrideMonthly / incomeSummary.totalMonthlyIncome) * 100}%`,
                  }}
                  title="BP-on-BP OR"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Personal
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {formatRupiah(incomeSummary.personalCommissionMonthly)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {((incomeSummary.personalCommissionMonthly / incomeSummary.totalMonthlyIncome) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                  <div className="flex items-center gap-1.5 text-sky-800 font-semibold mb-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Direct BP OR
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {formatRupiah(incomeSummary.directBpOverrideMonthly)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {((incomeSummary.directBpOverrideMonthly / incomeSummary.totalMonthlyIncome) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
                  <div className="flex items-center gap-1.5 text-purple-800 font-semibold mb-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    BP-on-BP
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {formatRupiah(incomeSummary.bpOnBpOverrideMonthly)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {((incomeSummary.bpOnBpOverrideMonthly / incomeSummary.totalMonthlyIncome) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              Belum ada penghasilan tercatat dalam skenario ini.
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab("simulator")}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Ubah Skema Kualifikasi
            </button>
            <button
              onClick={() => onNavigateTab("organization")}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Bagan Pohon Organisasi
            </button>
            <button
              onClick={() => onNavigateTab("timeline")}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Riwayat Peristiwa & Tanggal
            </button>
          </div>
        </div>

        {/* Right Column: Scenario Context & Quick Personal Addition */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Skenario Aktif
              </h3>
              <button
                onClick={() => onNavigateTab("scenarios")}
                className="text-xs font-semibold text-primary-600 hover:underline"
              >
                Kelola
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
              <div className="font-bold text-slate-800">{activeScenario.name}</div>
              <p className="text-[11px] text-slate-500">
                {activeScenario.description || "Tidak ada deskripsi"}
              </p>
              <div className="pt-1 text-[10px] text-slate-400">
                Diperbarui: {new Date(activeScenario.updatedAt).toLocaleDateString("id-ID")}
              </div>
            </div>
          </div>

          {/* Quick Simulation Help Card */}
          <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 text-xs space-y-2">
            <div className="font-bold text-sky-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-sky-600" />
              Prinsip Dasar Perhitungan:
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              Rate komisi/overriding ditentukan oleh status upline dan downline <strong>saat ALP dihasilkan</strong>. Promosi tidak berlaku surut.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab("simulator")}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Buka Simulator Wizard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <IncomeBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        summary={incomeSummary}
        rules={rules}
      />

      <AddDownlineModal
        isOpen={isAddDownlineOpen}
        onClose={() => setIsAddDownlineOpen(false)}
      />
    </div>
  );
};
