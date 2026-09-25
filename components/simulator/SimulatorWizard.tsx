"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useSimulator } from "../SimulatorContext";
import { formatRupiah, formatCompactRupiah } from "../../lib/utils/currency";
import { CurrencyInput } from "../ui/CurrencyInput";
import { QualificationScheme, ContributorInput, validateQualificationScheme } from "../../lib/business";
import { AddDownlineModal } from "./AddDownlineModal";
import { AddPersonalAlpModal } from "./AddPersonalAlpModal";
import { SaveScenarioModal } from "../scenarios/SaveScenarioModal";
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
  Coins,
  Save,
  RotateCcw,
  Sliders,
  History,
  Info,
} from "lucide-react";

export const SimulatorWizard: React.FC = () => {
  const {
    activeScenario,
    incomeSummary,
    updateSchemeSelection,
    startFreshScenario,
    deleteDownlinePerson,
    deleteAlpEvent,
    rules,
  } = useSimulator();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [userName, setUserName] = useState<string>(activeScenario.mainPerson.name || "Saya");
  const [selectedScheme, setSelectedScheme] = useState<QualificationScheme>(
    activeScenario.selectedScheme || "SCHEME_CUSTOM"
  );

  // Scheme Form Inputs
  const [schemeMainAlp, setSchemeMainAlp] = useState<number>(0);
  const [contributors, setContributors] = useState<ContributorInput[]>([]);

  // Modals state
  const [isAddDownlineOpen, setIsAddDownlineOpen] = useState(false);
  const [isAddPersonalOpen, setIsAddPersonalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedChildForModal, setSelectedChildForModal] = useState<string | undefined>();
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Sync inputs with active scenario on mount or scenario change
  useEffect(() => {
    setUserName(activeScenario.mainPerson.name || "Saya");
    const currentPersonalAlp = activeScenario.alpEvents
      .filter((e) => e.personId === activeScenario.mainPerson.id)
      .reduce((sum, e) => sum + e.amount, 0);

    setSchemeMainAlp(currentPersonalAlp);

    if (activeScenario.selectedScheme) {
      setSelectedScheme(activeScenario.selectedScheme);
    }

    // Load existing contributors if any
    const existingChildren = activeScenario.people.filter(
      (p) => p.parentId === activeScenario.mainPerson.id
    );

    if (existingChildren.length > 0) {
      const childData: ContributorInput[] = existingChildren.map((c) => {
        const cAlp = activeScenario.alpEvents
          .filter((e) => e.personId === c.id)
          .reduce((sum, e) => sum + e.amount, 0);
        return { name: c.name, alp: cAlp };
      });
      setContributors(childData);
    } else if (activeScenario.selectedScheme === "SCHEME_3") {
      setContributors([
        { name: "Mitra A", alp: 100_000_000 },
        { name: "Mitra B", alp: 100_000_000 },
      ]);
    } else if (activeScenario.selectedScheme === "SCHEME_2") {
      setContributors([
        { name: "Mitra A", alp: 50_000_000 },
        { name: "Mitra B", alp: 50_000_000 },
      ]);
    } else if (activeScenario.selectedScheme === "SCHEME_4") {
      setContributors([
        { name: "Mitra A", alp: 30_000_000 },
        { name: "Mitra B", alp: 20_000_000 },
        { name: "Mitra C", alp: 50_000_000 },
        { name: "Mitra D", alp: 100_000_000 },
      ]);
    } else {
      setContributors([]);
    }
  }, [activeScenario]);

  // Validation
  const validation = validateQualificationScheme(
    selectedScheme,
    schemeMainAlp,
    contributors,
    rules
  );

  // Trigger confetti when qualifying BP
  useEffect(() => {
    if (validation.isQualifiedBp && !hasCelebrated) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#0284c7", "#10b981", "#f59e0b"],
        });
      } catch {
        // Safe fallback
      }
      setHasCelebrated(true);
    } else if (!validation.isQualifiedBp) {
      setHasCelebrated(false);
    }
  }, [validation.isQualifiedBp, hasCelebrated]);

  const handleSelectScheme = (scheme: QualificationScheme) => {
    setSelectedScheme(scheme);
    if (scheme === "SCHEME_CUSTOM") {
      // Keep existing custom numbers
    } else if (scheme === "SCHEME_1") {
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

  const handleStartFromScratch = () => {
    startFreshScenario("Simulasi Baru (Mulai dari Nol)", 0);
    setUserName("Saya");
    setSchemeMainAlp(0);
    setContributors([]);
    setSelectedScheme("SCHEME_CUSTOM");
    setActiveStep(1);
    showNotification("Memulai simulasi baru dari nol!");
  };

  const handleApplyScheme = () => {
    updateSchemeSelection(selectedScheme, userName, {
      mainAlp: schemeMainAlp,
      contributors,
    });
    setActiveStep(3);
    showNotification("Skema dan parameter kualifikasi berhasil diterapkan!");
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
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Alur Simulasi Karier & Kompensasi</span>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
              {activeScenario.name}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Jalankan perjalanan bisnis agen: dari Agen BE pemula, kualifikasi BP, hingga pengembangan jaringan tim
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartFromScratch}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Reset ke agen baru tanpa data awal"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Mulai dari Nol</span>
          </button>

          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Skenario</span>
          </button>
        </div>
      </div>

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
            <span>Kualifikasi BP</span>
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
            <span>Ekspansi & Downline</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 hidden sm:inline">Status Anda:</span>
          <span className={`font-bold px-2 py-0.5 rounded ${
            incomeSummary.mainPersonStatus === "BP"
              ? "bg-purple-100 text-purple-700"
              : "bg-sky-100 text-sky-700"
          }`}>
            {incomeSummary.mainPersonStatus}
          </span>
        </div>
      </div>

      {/* STEP 1: Profil Utama & Produksi Awal */}
      {activeStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-600" />
              Langkah 1: Identitas & Produksi Personal Awal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan nama agen utama dan produksi penjualan pribadi awal sebelum atau saat masih berstatus Business Executive (BE).
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
                placeholder="Nama Anda (misal: Budi / Saya)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Awal
              </label>
              <input
                type="text"
                readOnly
                value="BE (Business Executive)"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Setiap agen memulai karier dari BE sebelum kualifikasi ke BP.
              </p>
            </div>

            <div className="md:col-span-2">
              <CurrencyInput
                label="Produksi Personal Awal (Personal ALP)"
                value={schemeMainAlp}
                onChange={setSchemeMainAlp}
                placeholder="0 jika baru mulai, atau misal: 50jt / 100jt"
                helperText="Produksi pribadi Anda akan menghasilkan komisi personal 23,25% / 12 (dibayar 24 bulan)."
              />
            </div>
          </div>

          {/* Real-time personal commission feedback */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium">Estimasi Komisi Personal Anda:</span>
              <div className="text-lg font-bold text-emerald-700 mt-0.5">
                {formatRupiah(Math.round((schemeMainAlp * rules.personalCommissionRate) / rules.monthsPerYear))}
                <span className="text-xs font-normal text-slate-500"> / bulan</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400 font-mono">
              {formatCompactRupiah(schemeMainAlp)} × 23,25% ÷ 12
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <button
              type="button"
              onClick={handleStartFromScratch}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Reset ke Nol
            </button>
            <button
              onClick={() => setActiveStep(2)}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Lanjut ke Kualifikasi BP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Kualifikasi BP (Target 300jt) */}
      {activeStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Langkah 2: Skema Kualifikasi Menjadi Business Partner (BP)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target promosi ke BP adalah <span className="font-semibold text-slate-700">Rp300.000.000 ALP</span>. Anda bisa memilih skema resmi atau kustom bertahap:
                </p>
              </div>

              {/* Progress Pill */}
              <div className="sm:text-right">
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
                  validation.isQualifiedBp ? "bg-emerald-500" : "bg-sky-500"
                }`}
                style={{ width: `${Math.min(100, validation.percentage)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] mt-1 font-medium text-slate-500">
              <span>{validation.percentage}% dari target Rp300jt</span>
              {validation.isQualifiedBp ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 🎉 Memenuhi Kualifikasi BP (Siap Promosi)
                </span>
              ) : (
                <span className="text-amber-600 font-semibold">
                  Status saat ini: BE (Kurang {formatCompactRupiah(rules.bpQualificationALP - validation.totalQualificationAlp)})
                </span>
              )}
            </div>
          </div>

          {/* 5 Scheme Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Card 0: Custom */}
            <div
              onClick={() => handleSelectScheme("SCHEME_CUSTOM")}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedScheme === "SCHEME_CUSTOM"
                  ? "border-sky-600 bg-sky-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  Kustom
                </span>
                {selectedScheme === "SCHEME_CUSTOM" && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Mulai Bebas / Bertahap</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Atur nominal & kontributor bebas dari nol.
              </p>
            </div>

            {/* Card 1 */}
            <div
              onClick={() => handleSelectScheme("SCHEME_1")}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedScheme === "SCHEME_1"
                  ? "border-sky-600 bg-sky-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Skema 1
                </span>
                {selectedScheme === "SCHEME_1" && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-xs">300 Juta Sendiri</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                100% produksi mandiri tanpa kontributor.
              </p>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => handleSelectScheme("SCHEME_2")}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedScheme === "SCHEME_2"
                  ? "border-sky-600 bg-sky-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Skema 2
                </span>
                {selectedScheme === "SCHEME_2" && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-xs">200 + 50 + 50</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Agen 200jt + 2 mitra (min 50jt/orang).
              </p>
            </div>

            {/* Card 3 */}
            <div
              onClick={() => handleSelectScheme("SCHEME_3")}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedScheme === "SCHEME_3"
                  ? "border-sky-600 bg-sky-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Skema 3
                </span>
                {selectedScheme === "SCHEME_3" && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-xs">100 + 100 + 100</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Agen 100jt + 2 mitra masing-masing 100jt.
              </p>
            </div>

            {/* Card 4 */}
            <div
              onClick={() => handleSelectScheme("SCHEME_4")}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedScheme === "SCHEME_4"
                  ? "border-sky-600 bg-sky-50/50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  Skema 4
                </span>
                {selectedScheme === "SCHEME_4" && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Keroyokan</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Distribusi bebas antar kontributor.
              </p>
            </div>
          </div>

          {/* Form Detail Input */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pengaturan Input Kualifikasi ({selectedScheme})
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
                  {(selectedScheme === "SCHEME_4" || selectedScheme === "SCHEME_CUSTOM") && (
                    <button
                      type="button"
                      onClick={handleAddContributor}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Kontributor
                    </button>
                  )}
                </div>

                {contributors.length === 0 ? (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 flex items-center justify-between">
                    <span>Belum ada kontributor kualifikasi.</span>
                    <button
                      type="button"
                      onClick={handleAddContributor}
                      className="text-primary-600 font-semibold text-xs hover:underline"
                    >
                      + Tambah Kontributor Pertama
                    </button>
                  </div>
                ) : (
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
                          {(selectedScheme === "SCHEME_4" || selectedScheme === "SCHEME_CUSTOM") && (
                            <button
                              type="button"
                              onClick={() => handleRemoveContributor(idx)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                              title="Hapus kontributor"
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
                )}
              </div>
            )}

            {/* Validation Feedback Banner */}
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              validation.isQualifiedBp
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-sky-50 border-sky-200 text-sky-800"
            }`}>
              {validation.isQualifiedBp ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
              )}
              <span className="font-medium">
                {validation.message}
              </span>
            </div>
          </div>

          {/* Action Footer (Non-blocking: User can proceed whether BE or BP!) */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={handleApplyScheme}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                validation.isQualifiedBp
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              <span>
                {validation.isQualifiedBp
                  ? "Terapkan & Lanjut (Resmi Promosi ke BP 🎉)"
                  : "Terapkan & Lanjut (Simulasi Status BE)"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Pertumbuhan Downline & Produksi Berjalan */}
      {activeStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Langkah 3: Simulasi Produksi Personal & Pertumbuhan Downline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Status Upline saat ini: <strong className="text-slate-800">{incomeSummary.mainPersonStatus}</strong>. Tambahkan penjualan polis baru dan saksikan perhitungan komisi & overriding secara langsung.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddPersonalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Coins className="w-4 h-4" />
                <span>+ Produksi Personal</span>
              </button>

              <button
                onClick={() => {
                  setSelectedChildForModal(undefined);
                  setIsAddDownlineOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Produksi Downline</span>
              </button>
            </div>
          </div>

          {/* Income Summary Strip */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-sky-950 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400">Total Penghasilan Anda:</span>
              <div className="text-2xl font-extrabold text-white">
                {formatRupiah(incomeSummary.totalMonthlyIncome)}
                <span className="text-xs font-normal text-slate-300"> / bulan</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Personal:</span>
                <span className="font-bold text-emerald-400">{formatRupiah(incomeSummary.personalCommissionMonthly)}</span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="text-slate-400 block text-[11px]">Direct BP OR:</span>
                <span className="font-bold text-sky-400">{formatRupiah(incomeSummary.directBpOverrideMonthly)}</span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="text-slate-400 block text-[11px]">BP-on-BP OR:</span>
                <span className="font-bold text-purple-400">{formatRupiah(incomeSummary.bpOnBpOverrideMonthly)}</span>
              </div>
            </div>
          </div>

          {/* Downline Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-500" />
                Daftar Mitra Jaringan ({downlines.length} Mitra)
              </h4>
            </div>

            {downlines.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="text-sm font-semibold text-slate-700">
                  Belum ada mitra downline dalam skenario ini
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tambahkan mitra baru untuk mensimulasikan pertumbuhan tim dan potensi overriding Anda.
                </p>
                <button
                  onClick={() => setIsAddDownlineOpen(true)}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors"
                >
                  + Tambah Mitra Pertama
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

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedChildForModal(child.id);
                              setIsAddDownlineOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> +Produksi
                          </button>
                          <button
                            onClick={() => deleteDownlinePerson(child.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                            title="Hapus mitra dari simulasi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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

                      {/* Classification details */}
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
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
                            Belum ada overriding (transaksi awal kualifikasi atau Upline masih BE)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Event Ledger with Delete Option */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                Riwayat Transaksi Terkini ({activeScenario.alpEvents.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                Klik ikon tempat sampah jika ingin membatalkan/menghapus transaksi
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {activeScenario.alpEvents.slice().reverse().map((e) => {
                const producer = activeScenario.people.find((p) => p.id === e.personId);
                const isMain = e.personId === activeScenario.mainPerson.id;

                return (
                  <div
                    key={e.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {isMain ? "Personal Anda" : producer?.name || "Mitra"}: {formatRupiah(e.amount)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                          {e.classification}
                        </span>
                        <span className="text-[10px] text-slate-400">{e.date}</span>
                      </div>
                      {e.monthlyIncomeToParent > 0 && (
                        <div className="text-[11px] text-sky-700 font-medium mt-0.5">
                          Overriding ke Upline: +{formatRupiah(e.monthlyIncomeToParent)}/bulan
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteAlpEvent(e.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                      title="Hapus transaksi ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Kembali ke Kualifikasi
            </button>
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Skenario Ini</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddDownlineModal
        isOpen={isAddDownlineOpen}
        onClose={() => setIsAddDownlineOpen(false)}
        defaultChildId={selectedChildForModal}
      />

      <AddPersonalAlpModal
        isOpen={isAddPersonalOpen}
        onClose={() => setIsAddPersonalOpen(false)}
      />

      <SaveScenarioModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        defaultMode="save_as_new"
      />
    </div>
  );
};
