"use client";

import React, { useState, useMemo } from "react";
import { formatRupiah } from "../../lib/utils/currency";
import { CurrencyInput } from "../ui/CurrencyInput";
import { useSimulator } from "../SimulatorContext";
import {
  splitAndClassifyAlpTransaction,
  getPersonPersonalAlp,
  getPersonCurrentStatus,
} from "../../lib/business";
import { X, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface AddDownlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChildId?: string;
}

export const AddDownlineModal: React.FC<AddDownlineModalProps> = ({
  isOpen,
  onClose,
  defaultChildId,
}) => {
  const {
    activeScenario,
    addDownlineProduction,
    addNewDownlinePerson,
    rules,
  } = useSimulator();

  const children = useMemo(() => {
    return activeScenario.people.filter(
      (p) => p.parentId === activeScenario.mainPerson.id
    );
  }, [activeScenario]);

  const [selectedChildId, setSelectedChildId] = useState<string>(
    defaultChildId || children[0]?.id || ""
  );
  const [isAddingNewChild, setIsAddingNewChild] = useState<boolean>(false);
  const [newChildName, setNewChildName] = useState<string>("");
  const [additionalAlp, setAdditionalAlp] = useState<number>(100_000_000);
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Set initial selectedChildId if empty
  React.useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const currentChildAlp = selectedChild
    ? getPersonPersonalAlp(selectedChild.id, activeScenario.alpEvents)
    : 0;

  const currentChildStatus = selectedChild
    ? getPersonCurrentStatus(
        selectedChild.id,
        activeScenario.people,
        activeScenario.promotionEvents
      )
    : "BE";

  const parentStatus = getPersonCurrentStatus(
    activeScenario.mainPerson.id,
    activeScenario.people,
    activeScenario.promotionEvents
  );

  // Live preview of tranche classification before user clicks confirm!
  const previewTranches = useMemo(() => {
    if (additionalAlp <= 0) return [];
    return splitAndClassifyAlpTransaction(
      currentChildAlp,
      additionalAlp,
      parentStatus,
      rules
    );
  }, [currentChildAlp, additionalAlp, parentStatus, rules]);

  const previewTotalIncome = useMemo(() => {
    return previewTranches.reduce(
      (sum, t) => sum + t.monthlyIncomeToParent,
      0
    );
  }, [previewTranches]);

  const projectedTotalAlp = currentChildAlp + additionalAlp;
  const willBecomeBp =
    currentChildStatus === "BE" && projectedTotalAlp >= rules.bpQualificationALP;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingNewChild) {
      if (!newChildName.trim()) return;
      addNewDownlinePerson(newChildName, additionalAlp);
    } else {
      if (!selectedChildId || additionalAlp <= 0) return;
      addDownlineProduction(selectedChildId, additionalAlp, date);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tambah Produksi ALP Downline
              </h3>
              <p className="text-xs text-slate-500">
                Simulasi transaksi produksi baru mitra dan hitung overriding secara real-time
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Mitra Selector */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Pilih Mitra Downline
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewChild(!isAddingNewChild)}
                className="text-xs text-primary-600 font-semibold hover:underline"
              >
                {isAddingNewChild ? "Pilih dari daftar mitra" : "+ Mitra Baru"}
              </button>
            </div>

            {isAddingNewChild ? (
              <input
                type="text"
                required
                placeholder="Nama Mitra Baru (misal: Mitra C)"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            ) : children.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                Belum ada mitra terdaftar. Silakan klik &ldquo;+ Mitra Baru&rdquo; untuk menambahkan.
              </div>
            ) : (
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white"
              >
                {children.map((c) => {
                  const alp = getPersonPersonalAlp(c.id, activeScenario.alpEvents);
                  const st = getPersonCurrentStatus(
                    c.id,
                    activeScenario.people,
                    activeScenario.promotionEvents
                  );
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({st} - Kumulatif ALP: {formatRupiah(alp)})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Child Current Stats Badge */}
          {!isAddingNewChild && selectedChild && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Status Saat Ini: </span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  currentChildStatus === "BP"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-sky-100 text-sky-700"
                }`}>
                  {currentChildStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Kumulatif ALP: </span>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(currentChildAlp)}
                </span>
              </div>
            </div>
          )}

          {/* Input Amount */}
          <CurrencyInput
            label="Jumlah Produksi ALP Baru"
            value={additionalAlp}
            onChange={setAdditionalAlp}
            placeholder="Contoh: 100jt atau 200.000.000"
          />

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          {/* LIVE PREVIEW BOX - MANDATORY REQUIREMENT */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-sky-200/60 pb-2">
              <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                Live Preview Klasifikasi & Overriding
              </span>
              <span className="text-xs font-bold text-sky-700">
                +{formatRupiah(previewTotalIncome)} / bulan
              </span>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Status Upline (Anda) saat ini:</span>
                <span className="font-bold text-slate-800">{parentStatus}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Kumulatif Setelah Transaksi:</span>
                <span className="font-bold text-slate-800">
                  {formatRupiah(projectedTotalAlp)}
                </span>
              </div>
              {willBecomeBp && (
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded font-medium text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Transaksi ini akan mempromosikan mitra menjadi BP (karena mencapai target Rp300jt).
                </div>
              )}
            </div>

            {/* Tranches Detail */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Tranche Transaksi:
              </span>
              {previewTranches.map((t, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white rounded-lg border border-sky-100 shadow-sm text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">
                      Tranche {idx + 1}: {formatRupiah(t.amount)}
                    </span>
                    <span className="font-bold text-sky-700">
                      {formatRupiah(t.monthlyIncomeToParent)}/bln
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                      Kategori: {t.classification}
                    </span>
                    <span>Rate: {(t.rateAppliedToParent * 100).toFixed(4).replace(".", ",")}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    {t.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={additionalAlp <= 0 || (!isAddingNewChild && !selectedChildId)}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <span>Konfirmasi & Simpan Transaksi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
