"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useSimulator } from "../SimulatorContext";
import { formatRupiah, formatCompactRupiah } from "../../lib/utils/currency";
import { CurrencyInput } from "../ui/CurrencyInput";
import { QualificationScheme, ContributorInput, validateQualificationScheme } from "../../lib/business";
import { AddDownlineModal } from "./AddDownlineModal";
import {
  User,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export const SimulatorWizard: React.FC = () => {
  const {
    activeScenario,
    incomeSummary,
    updateSchemeSelection,
    addPersonalAlp,
    rules,
  } = useSimulator();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2);
  const [userName, setUserName] = useState<string>(activeScenario.mainPerson.name || "Saya");
  const [selectedScheme, setSelectedScheme] = useState<QualificationScheme>(
    activeScenario.selectedScheme || "SCHEME_3"
  );

  // Scheme Form Inputs
  const [schemeMainAlp, setSchemeMainAlp] = useState<number>(100_000_000);
  const [contributors, setContributors] = useState<ContributorInput[]>([
    { name: "Mitra A", alp: 100_000_000 },
    { name: "Mitra B", alp: 100_000_000 },
  ]);

  const [isAddDownlineOpen, setIsAddDownlineOpen] = useState(false);
  const [selectedChildForModal, setSelectedChildForModal] = useState<string | undefined>();
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Sync inputs with active scenario on mount or scenario change
  useEffect(() => {
    setUserName(activeScenario.mainPerson.name || "Saya");
    if (activeScenario.selectedScheme) {
      setSelectedScheme(activeScenario.selectedScheme);
      if (activeScenario.selectedScheme === "SCHEME_1") {
        setSchemeMainAlp(300_000_000);
        setContributors([]);
      } else if (activeScenario.selectedScheme === "SCHEME_2") {
        setSchemeMainAlp(200_000_000);
        setContributors([
          { name: "Mitra A", alp: 50_000_000 },
          { name: "Mitra B", alp: 50_000_000 },
        ]);
      } else if (activeScenario.selectedScheme === "SCHEME_3") {
        setSchemeMainAlp(100_000_000);
        setContributors([
          { name: "Mitra A", alp: 100_000_000 },
          { name: "Mitra B", alp: 100_000_000 },
        ]);
      } else if (activeScenario.selectedScheme === "SCHEME_4") {
        setSchemeMainAlp(100_000_000);
        setContributors([
          { name: "Mitra A", alp: 30_000_000 },
          { name: "Mitra B", alp: 20_000_000 },
          { name: "Mitra C", alp: 50_000_000 },
          { name: "Mitra D", alp: 100_000_000 },
        ]);
      }
    }
  }, [activeScenario]);

  // Validation
  const validation = validateQualificationScheme(
    selectedScheme,
    schemeMainAlp,
    contributors,
    rules
  );

  // Trigger confetti when qualifying
  useEffect(() => {
    if (validation.isValid && !hasCelebrated) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#0284c7", "#10b981", "#f59e0b"],
        });
      } catch {
        // Safe fallback if confetti canvas is not supported
      }
      setHasCelebrated(true);
    } else if (!validation.isValid) {
      setHasCelebrated(false);
    }
  }, [validation.isValid, hasCelebrated]);

  const handleSelectScheme = (scheme: QualificationScheme) => {
    setSelectedScheme(scheme);
    if (scheme === "SCHEME_1") {
      setSchemeMainAlp(300_000_000);
      setContributors([]);
    } else if (scheme === "SCHEME_2") {
      setSchemeMainAlp(200_000_000);
      setContributors([
        { name: "Mitra A", alp: 50_000_000 },
        { name: "Mitra B", alp: 50_000_000 },
      ]);
    } else if (scheme === "SCHEME_3") {
      setSchemeMainAlp(100_000_000);
      setContributors([
        { name: "Mitra A", alp: 100_000_000 },
        { name: "Mitra B", alp: 100_000_000 },
      ]);
    } else if (scheme === "SCHEME_4") {
      setSchemeMainAlp(100_000_000);
      setContributors([
        { name: "Mitra A", alp: 30_000_000 },
        { name: "Mitra B", alp: 20_000_000 },
        { name: "Mitra C", alp: 50_000_000 },
        { name: "Mitra D", alp: 100_000_000 },
      ]);
    }
  };

  const handleApplyScheme = () => {
    updateSchemeSelection(selectedScheme, userName, {
      mainAlp: schemeMainAlp,
      contributors,
    });
    setActiveStep(3);
  };

  const handleAddContributor = () => {
    const nextChar = String.fromCharCode(65 + contributors.length);
    setContributors([
      ...contributors,
      { name: `Mitra ${nextChar}`, alp: 50_000_000 },
    ]);
  };

  const handleRemoveContributor = (index: number) => {
    setContributors(contributors.filter((_, idx) => idx !== index));
  };

  const handleUpdateContributor = (
    index: number,
    field: "name" | "alp",
    val: string | number
  ) => {
    const updated = [...contributors];
    if (field === "name") {
      updated[index].name = val as string;
    } else {
      updated[index].alp = val as number;
    }
    setContributors(updated);
  };

  const downlines = activeScenario.people.filter(
    (p) => p.parentId === activeScenario.mainPerson.id
  );

  return (
    <div className="space-y-6">
      {/* Wizard Step Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${
              activeStep === 1
                ? "text-primary-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              activeStep === 1 ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              1
            </span>
            <span>Profil Utama</span>
          </button>

          <span className="text-slate-300">/</span>

          <button
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${
              activeStep === 2
                ? "text-primary-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              activeStep === 2 ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              2
            </span>
            <span>Skema Kualifikasi BP</span>
          </button>

          <span className="text-slate-300">/</span>

          <button
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${
              activeStep === 3
                ? "text-primary-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              activeStep === 3 ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"
            }`}>
              3
            </span>
            <span>Pertumbuhan Downline</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-500">Status Anda:</span>
          <span className={`font-bold px-2 py-0.5 rounded ${
            incomeSummary.mainPersonStatus === "BP"
              ? "bg-purple-100 text-purple-700"
              : "bg-sky-100 text-sky-700"
          }`}>
            {incomeSummary.mainPersonStatus}
          </span>
        </div>
      </div>

      {/* STEP 1: Profil Utama */}
      {activeStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-600" />
              Langkah 1: Profil Agen Utama
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan identitas dan status awal agen yang akan disimulasikan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Agen Utama
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="Nama Anda"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Awal
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="BE (Business Executive)"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Setiap agen memulai karier dari Business Executive (BE) sebelum kualifikasi ke BP.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setActiveStep(2)}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Lanjut ke Pilih Skema BP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Pilih Cara Menjadi BP */}
      {activeStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Langkah 2: Pilih Cara Menjadi Business Partner (BP)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target kualifikasi BP adalah <span className="font-semibold text-slate-700">Rp300.000.000 ALP</span>. Pilih 1 dari 4 skema kualifikasi resmi di bawah ini:
                </p>
              </div>

              {/* Progress Pill */}
              <div className="text-right">
                <span className="text-[11px] font-medium text-slate-500">
                  Total Terkumpul:
                </span>
                <div className="text-sm font-extrabold text-slate-900">
                  {formatCompactRupiah(validation.totalQualificationAlp)} / {formatCompactRupiah(rules.bpQualificationALP)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  validation.isValid ? "bg-emerald-500" : "bg-sky-500"
                }`}
                style={{ width: `${Math.min(100, validation.percentage)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] mt-1 font-medium text-slate-500">
              <span>{validation.percentage}% dari target kualifikasi</span>
              {validation.isValid ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 🎉 Memenuhi Kualifikasi BP
                </span>
              ) : (
                <span className="text-amber-600 font-semibold">
                  Kurang {formatCompactRupiah(rules.bpQualificationALP - validation.totalQualificationAlp)}
                </span>
              )}
            </div>
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div
              onClick={() => handleSelectScheme("SCHEME_1")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedScheme === "SCHEME_1"
                  ? "border-sky-600 bg-sky-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Skema 1
                </span>
                {selectedScheme === "SCHEME_1" && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">300 Juta Sendiri</h4>
              <p className="text-xs text-slate-500 mt-1">
                100% produksi mandiri oleh agen utama tanpa kontributor.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                Komisi: <span className="font-bold text-slate-800">Rp5.812.500/bln</span>
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => handleSelectScheme("SCHEME_2")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedScheme === "SCHEME_2"
                  ? "border-sky-600 bg-sky-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Skema 2
                </span>
                {selectedScheme === "SCHEME_2" && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">200 + 50 + 50</h4>
              <p className="text-xs text-slate-500 mt-1">
                Agen 200jt + 2 kontributor (min. 50jt/orang).
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                Komisi Utama: <span className="font-bold text-slate-800">Rp3.875.000/bln</span>
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => handleSelectScheme("SCHEME_3")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedScheme === "SCHEME_3"
                  ? "border-sky-600 bg-sky-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Skema 3
                </span>
                {selectedScheme === "SCHEME_3" && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">100 + 100 + 100</h4>
              <p className="text-xs text-slate-500 mt-1">
                Agen 100jt + 2 kontributor masing-masing 100jt.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                Komisi Utama: <span className="font-bold text-slate-800">Rp1.937.500/bln</span>
              </div>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => handleSelectScheme("SCHEME_4")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedScheme === "SCHEME_4"
                  ? "border-sky-600 bg-sky-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Skema 4
                </span>
                {selectedScheme === "SCHEME_4" && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Keroyokan / Fleksibel</h4>
              <p className="text-xs text-slate-500 mt-1">
                Distribusi bebas antar kontributor tanpa batas minimum.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
                Syarat: <span className="font-bold text-slate-800">Total &ge; Rp300jt</span>
              </div>
            </div>
          </div>

          {/* Scheme Form Detail */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Input Parameter Kualifikasi ({selectedScheme})
            </h4>

            {/* Main Person Production */}
            <div className="max-w-md">
              <CurrencyInput
                label={`Produksi Personal ${userName} (Agen Utama)`}
                value={schemeMainAlp}
                onChange={setSchemeMainAlp}
                error={validation.mainError}
              />
            </div>

            {/* Contributors Section */}
            {selectedScheme !== "SCHEME_1" && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Daftar Kontributor Kualifikasi ({contributors.length} orang)
                  </span>
                  {selectedScheme === "SCHEME_4" && (
                    <button
                      type="button"
                      onClick={handleAddContributor}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Kontributor
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contributors.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) =>
                            handleUpdateContributor(idx, "name", e.target.value)
                          }
                          className="font-bold text-xs text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 focus:outline-none"
                        />
                        {selectedScheme === "SCHEME_4" && contributors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveContributor(idx)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <CurrencyInput
                        value={c.alp}
                        onChange={(val) => handleUpdateContributor(idx, "alp", val)}
                        error={validation.contributorErrors?.[idx]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Feedback Banner */}
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              validation.isValid
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              {validation.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-medium">
                {validation.message || (validation.isValid ? "Syarat terpenuhi." : "Lengkapi syarat kualifikasi.")}
              </span>
            </div>

            {/* Important Rule Notice */}
            <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs text-sky-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-sky-800">
                <ShieldAlert className="w-3.5 h-3.5" />
                Catatan Penting Bisnis:
              </span>
              <p className="text-[11px] text-sky-800">
                Volume kualifikasi kontributor <span className="font-semibold">TIDAK otomatis menjadi komisi personal Anda</span>. Saat transaksi awal ini terjadi, Anda masih berstatus BE sehingga Anda mendapatkan <span className="font-bold">Rp0 overriding</span> dari ALP awal kontributor. Komisi personal mereka tetap menjadi hak mereka.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={handleApplyScheme}
              disabled={!validation.isValid}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <span>Terapkan Skema & Lanjut ke Downline</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Pertumbuhan Downline */}
      {activeStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Langkah 3: Simulasi Pertumbuhan & Produksi Downline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambahkan transaksi baru untuk mitra langsung setelah Anda resmi menjadi BP.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedChildForModal(undefined);
                setIsAddDownlineOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produksi Anak</span>
            </button>
          </div>

          {/* Downline Cards */}
          {downlines.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">
                Belum ada mitra downline dalam skema ini
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Anda memilih Skema 1 (Full Personal). Anda dapat menambahkan mitra baru untuk mulai mensimulasikan overriding.
              </p>
              <button
                onClick={() => setIsAddDownlineOpen(true)}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors"
              >
                + Tambah Mitra Downline Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {downlines.map((child) => {
                const childAlp = activeScenario.alpEvents
                  .filter((e) => e.personId === child.id)
                  .reduce((sum, e) => sum + e.amount, 0);

                const isChildBp = activeScenario.promotionEvents.some(
                  (p) => p.personId === child.id && p.to === "BP"
                );
                const status = isChildBp ? "BP" : "BE";

                // Overriding generated by this child for Main person
                const directOrMonthly = activeScenario.alpEvents
                  .filter((e) => e.personId === child.id && e.classification === "DIRECT_BP_OVERRIDE")
                  .reduce((sum, e) => sum + e.monthlyIncomeToParent, 0);

                const bpOnBpMonthly = activeScenario.alpEvents
                  .filter((e) => e.personId === child.id && e.classification === "BP_ON_BP")
                  .reduce((sum, e) => sum + e.monthlyIncomeToParent, 0);

                const totalIncomeFromChild = directOrMonthly + bpOnBpMonthly;

                return (
                  <div
                    key={child.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                          {child.name.charAt(child.name.length - 1) || "M"}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{child.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            status === "BP" ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-sky-700"
                          }`}>
                            Status: {status}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedChildForModal(child.id);
                          setIsAddDownlineOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> +Produksi
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                      <div className="p-2 rounded bg-slate-50">
                        <span className="text-[11px] text-slate-500">Kumulatif ALP:</span>
                        <div className="font-bold text-slate-800">{formatRupiah(childAlp)}</div>
                      </div>
                      <div className="p-2 rounded bg-sky-50/70">
                        <span className="text-[11px] text-sky-700">Overriding ke Anda:</span>
                        <div className="font-bold text-sky-900">{formatRupiah(totalIncomeFromChild)}/bln</div>
                      </div>
                    </div>

                    {/* Breakdown pill */}
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {directOrMonthly > 0 && (
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-medium">
                          Direct OR: {formatRupiah(directOrMonthly)}/bln
                        </span>
                      )}
                      {bpOnBpMonthly > 0 && (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                          BP-on-BP: {formatRupiah(bpOnBpMonthly)}/bln
                        </span>
                      )}
                      {totalIncomeFromChild === 0 && (
                        <span className="text-slate-400 italic">
                          Belum ada overriding (transaksi awal kualifikasi)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Kembali ke Skema
            </button>
            <div className="text-xs text-slate-500 font-medium">
              Data tersimpan otomatis di browser (localStorage)
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Downline Production */}
      <AddDownlineModal
        isOpen={isAddDownlineOpen}
        onClose={() => setIsAddDownlineOpen(false)}
        defaultChildId={selectedChildForModal}
      />
    </div>
  );
};
