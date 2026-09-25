"use client";

import React, { useState } from "react";
import { formatRupiah } from "../../lib/utils/currency";
import { CurrencyInput } from "../ui/CurrencyInput";
import { useSimulator } from "../SimulatorContext";
import { X, Coins, CheckCircle2, ArrowRight } from "lucide-react";

interface AddPersonalAlpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPersonalAlpModal: React.FC<AddPersonalAlpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeScenario, incomeSummary, addPersonalAlp, rules } = useSimulator();

  const [amount, setAmount] = useState<number>(50_000_000);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState<string>("");

  if (!isOpen) return null;

  const currentAlp = incomeSummary.personalAlp;
  const newTotalAlp = currentAlp + amount;
  const monthlyCommission = Math.round((amount * rules.personalCommissionRate) / rules.monthsPerYear);
  const willPromote =
    incomeSummary.mainPersonStatus === "BE" &&
    newTotalAlp >= rules.bpQualificationALP;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    addPersonalAlp(amount, date, description.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tambah Produksi Personal Anda
              </h3>
              <p className="text-xs text-slate-500">
                Simulasi polis pribadi tambahan yang menghasilkan komisi 23,25% / 12
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <CurrencyInput
            label="Nominal Produksi Personal Tambahan"
            value={amount}
            onChange={setAmount}
            placeholder="Contoh: 50jt atau 100.000.000"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Transaksi (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Misal: Polis Jiwa Tradisional Nasabah X"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Impact Preview */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
            <div className="font-bold text-emerald-900 flex items-center justify-between">
              <span>Preview Dampak Transaksi:</span>
              <span className="text-emerald-700">+{formatRupiah(monthlyCommission)}/bln</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>Personal ALP Saat Ini:</span>
              <span className="font-semibold text-slate-800">{formatRupiah(currentAlp)}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>Personal ALP Setelah Transaksi:</span>
              <span className="font-bold text-slate-900">{formatRupiah(newTotalAlp)}</span>
            </div>
            <div className="text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/60 font-mono">
              Rumus: {formatRupiah(amount)} × 23,25% ÷ 12 = {formatRupiah(monthlyCommission)}/bulan
            </div>
            {willPromote && (
              <div className="p-2 bg-emerald-100/90 text-emerald-900 rounded font-bold text-[11px] flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Transaksi ini memenuhi target Rp300jt dan mempromosikan Anda menjadi BP!
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={amount <= 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Simpan Produksi Personal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
