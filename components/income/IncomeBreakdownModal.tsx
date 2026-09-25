"use client";

import React from "react";
import { formatRupiah } from "../../lib/utils/currency";
import { ScenarioIncomeSummary, BusinessRulesConfig } from "../../lib/business";
import { X, Calculator, Info, ShieldCheck, ArrowRight } from "lucide-react";

interface IncomeBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ScenarioIncomeSummary;
  rules: BusinessRulesConfig;
}

export const IncomeBreakdownModal: React.FC<IncomeBreakdownModalProps> = ({
  isOpen,
  onClose,
  summary,
  rules,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Audit & Rincian Perhitungan Penghasilan
              </h3>
              <p className="text-xs text-slate-500">
                Transparansi rumus matematis setiap rupiah komisi & overriding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Total Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                Total Estimasi Bulanan
              </span>
              <div className="text-2xl font-extrabold text-slate-900">
                {formatRupiah(summary.totalMonthlyIncome)}
                <span className="text-sm font-normal text-slate-500"> / bulan</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500">Status Anda</span>
              <div className="flex items-center gap-1.5 font-bold text-sky-800">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                {summary.mainPersonStatus}
              </div>
            </div>
          </div>

          {/* Section 1: Komisi Personal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="font-bold text-slate-900 text-sm">
                  1. Komisi Personal (23,25%)
                </h4>
              </div>
              <span className="font-bold text-emerald-700 text-sm">
                {formatRupiah(summary.personalCommissionMonthly)} / bulan
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Personal ALP Anda:</span>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(summary.personalAlp)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Persentase Komisi:</span>
                <span className="font-semibold text-slate-800">23,25%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pembagian Bulanan:</span>
                <span className="font-semibold text-slate-800">÷ 12 bulan (diilustrasikan 24 bulan)</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 font-mono text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded">
                Rumus: {summary.breakdown.personal.formula}
              </div>
            </div>
          </div>

          {/* Section 2: Direct BP Overriding */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <h4 className="font-bold text-slate-900 text-sm">
                  2. Direct BP Overriding (12,7875%)
                </h4>
              </div>
              <span className="font-bold text-sky-700 text-sm">
                {formatRupiah(summary.directBpOverrideMonthly)} / bulan
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 text-xs">
              <p className="text-slate-600">
                Diperoleh saat Anda berstatus <span className="font-bold text-slate-800">BP</span> dari produksi mitra langsung yang masih berstatus <span className="font-bold text-slate-800">BE</span>.
                (Rate: 23,25% × 55% = 12,7875%).
              </p>

              {summary.breakdown.directBp.length === 0 ? (
                <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-500 italic">
                  Belum ada produksi mitra BE yang memenuhi syarat setelah Anda menjadi BP.
                </div>
              ) : (
                summary.breakdown.directBp.map((item) => (
                  <div
                    key={item.childId}
                    className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{item.childName}</span>
                      <span className="font-bold text-sky-700">{formatRupiah(item.monthly)}/bln</span>
                    </div>
                    <div className="text-slate-500">
                      Eligible ALP: <span className="font-semibold text-slate-700">{formatRupiah(item.eligibleAlp)}</span>
                    </div>
                    <div className="font-mono text-[11px] text-sky-800 bg-sky-50/80 p-1.5 rounded">
                      Rumus: {item.formula}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 3: BP-on-BP Overriding */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h4 className="font-bold text-slate-900 text-sm">
                  3. BP-on-BP Overriding (4,65%)
                </h4>
              </div>
              <span className="font-bold text-purple-700 text-sm">
                {formatRupiah(summary.bpOnBpOverrideMonthly)} / bulan
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 text-xs">
              <p className="text-slate-600">
                Diperoleh dari produksi mitra <span className="font-bold text-slate-800">setelah mitra tersebut resmi menjadi BP</span> (Post-BP ALP).
                (Rate: 23,25% × 20% = 4,65%).
              </p>

              {summary.breakdown.bpOnBp.length === 0 ? (
                <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-500 italic">
                  Belum ada produksi post-BP dari mitra yang sudah BP.
                </div>
              ) : (
                summary.breakdown.bpOnBp.map((item) => (
                  <div
                    key={item.childId}
                    className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{item.childName}</span>
                      <span className="font-bold text-purple-700">{formatRupiah(item.monthly)}/bln</span>
                    </div>
                    <div className="text-slate-500">
                      Eligible Post-BP ALP: <span className="font-semibold text-slate-700">{formatRupiah(item.eligibleAlp)}</span>
                    </div>
                    <div className="font-mono text-[11px] text-purple-800 bg-purple-50/80 p-1.5 rounded">
                      Rumus: {item.formula}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Produksi Non-Overriding / Historis */}
          {summary.breakdown.noOverride.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-slate-800 text-sm">
                  Transaksi Historis Tanpa Overriding (0%)
                </h4>
              </div>
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2 text-xs">
                <p className="text-slate-700">
                  Transaksi berikut <span className="font-semibold text-amber-900">tidak menghasilkan overriding bagi Anda</span> karena saat transaksi tersebut terjadi, Anda masih berstatus BE (kualifikasi awal). Status promosi tidak berlaku surut.
                </p>
                {summary.breakdown.noOverride.map((item) => (
                  <div
                    key={item.childId}
                    className="flex justify-between items-center p-2 bg-white/80 rounded border border-amber-200/60"
                  >
                    <span className="font-medium text-slate-800">{item.childName}</span>
                    <span className="text-slate-600">
                      {formatRupiah(item.alp)} (OR: Rp 0)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
};
