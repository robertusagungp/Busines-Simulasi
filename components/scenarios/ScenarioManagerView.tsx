import React, { useState } from "react";
import { useSimulator } from "../SimulatorContext";
import { formatRupiah, formatCompactRupiah } from "../../lib/utils/currency";
import { calculateScenarioIncome, QualificationScheme } from "../../lib/business";
import { SaveScenarioModal } from "./SaveScenarioModal";
import {
  Layers,
  Copy,
  Edit2,
  Trash2,
  RotateCcw,
  Plus,
  Check,
  X,
  BarChart3,
  CheckCircle2,
  Save,
  Sparkles,
} from "lucide-react";

export const ScenarioManagerView: React.FC = () => {
  const {
    scenarios,
    activeScenarioId,
    switchScenario,
    createNewScenario,
    startFreshScenario,
    duplicateCurrentScenario,
    renameScenario,
    deleteScenario,
    resetAllToDefault,
  } = useSimulator();

  const [isCreating, setIsCreating] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [selectedSchemeForNew, setSelectedSchemeForNew] = useState<QualificationScheme>("SCHEME_CUSTOM");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditNameText(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (editNameText.trim()) {
      renameScenario(id, editNameText.trim());
    }
    setEditingId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    if (selectedSchemeForNew === "SCHEME_CUSTOM") {
      startFreshScenario(newScenarioName.trim(), 0);
    } else {
      createNewScenario(newScenarioName.trim(), selectedSchemeForNew);
    }
    setNewScenarioName("");
    setIsCreating(false);
  };

  // Pre-calculate comparisons across all scenarios
  const scenarioComparisons = scenarios.map((s) => {
    const summary = calculateScenarioIncome(
      s.mainPerson.id,
      s.people,
      s.alpEvents,
      s.promotionEvents,
      s.rules
    );
    return {
      scenario: s,
      summary,
    };
  });

  const maxIncome = Math.max(
    ...scenarioComparisons.map((c) => c.summary.totalMonthlyIncome),
    1
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            Manajemen & Perbandingan Skenario Bisnis
          </h3>
          <p className="text-xs text-slate-500">
            Simpan berbagai simulasi strategi dan bandingkan penghasilan secara berdampingan (side-by-side)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => startFreshScenario("Simulasi Baru (Mulai dari Nol)", 0)}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Mulai simulasi agen baru dari nol"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Mulai dari Nol</span>
          </button>

          <button
            onClick={() => setIsCreating(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Skenario Baru</span>
          </button>

          <button
            onClick={resetAllToDefault}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Reset ke skenario awal bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>
        </div>
      </div>

      {/* New Scenario Form Modal/Card */}
      {isCreating && (
        <form
          onSubmit={handleCreateNew}
          className="p-5 bg-white rounded-2xl border-2 border-sky-300 shadow-md space-y-3"
        >
          <div className="font-bold text-sm text-slate-800">Buat Skenario Simulasi Baru</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Nama skenario (misal: Rencana Agen Baru 2026)"
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              className="sm:col-span-2 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
            <select
              value={selectedSchemeForNew}
              onChange={(e) => setSelectedSchemeForNew(e.target.value as QualificationScheme)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:border-sky-500 bg-white"
            >
              <option value="SCHEME_CUSTOM">Mulai dari Nol (Kustom Bebas)</option>
              <option value="SCHEME_1">Skema 1 (300jt Sendiri)</option>
              <option value="SCHEME_2">Skema 2 (200 + 50 + 50)</option>
              <option value="SCHEME_3">Skema 3 (100 + 100 + 100)</option>
              <option value="SCHEME_4">Skema 4 (Keroyokan)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3.5 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors"
            >
              Buat Skenario
            </button>
          </div>
        </form>
      )}

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarioComparisons.map(({ scenario, summary }) => {
          const isActive = scenario.id === activeScenarioId;

          return (
            <div
              key={scenario.id}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                isActive
                  ? "border-sky-600 bg-sky-50/40 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isActive ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {isActive ? "Aktif" : "Skenario"}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartRename(scenario.id, scenario.name)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      title="Ubah nama"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isActive && (
                      <button
                        onClick={() => duplicateCurrentScenario()}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                        title="Duplikat"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {scenarios.length > 1 && (
                      <button
                        onClick={() => deleteScenario(scenario.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {editingId === scenario.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editNameText}
                      onChange={(e) => setEditNameText(e.target.value)}
                      className="text-xs font-bold border border-sky-400 rounded px-2 py-1 w-full"
                    />
                    <button
                      onClick={() => handleSaveRename(scenario.id)}
                      className="p-1 text-emerald-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {scenario.name}
                  </h4>
                )}

                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {scenario.description || "Simulasi strategi kompensasi bisnis."}
                </p>
              </div>

              {/* Summary Stats */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Estimasi Bulanan:</span>
                  <span className="font-extrabold text-sky-900 text-sm">
                    {formatRupiah(summary.totalMonthlyIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Total Org ALP:</span>
                  <span className="font-semibold text-slate-700">
                    {formatCompactRupiah(summary.totalOrganizationAlp)}
                  </span>
                </div>
              </div>

              {/* Switch Button */}
              {!isActive ? (
                <button
                  onClick={() => switchScenario(scenario.id)}
                  className="w-full py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                >
                  Jadikan Skenario Aktif
                </button>
              ) : (
                <div className="text-center py-1.5 text-xs font-semibold text-sky-700 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sedang Aktif
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Table (Section 19) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-600" />
          <h4 className="text-sm font-bold text-slate-900">
            Tabel Komparasi Berdampingan (Side-by-Side)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70">
                <th className="py-3 px-4 font-semibold">Metrik / Parameter</th>
                {scenarioComparisons.map(({ scenario }) => (
                  <th key={scenario.id} className="py-3 px-4 font-bold text-slate-800 text-right">
                    {scenario.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 text-slate-600 font-medium">Status Agen Utama</td>
                {scenarioComparisons.map(({ scenario, summary }) => (
                  <td key={scenario.id} className="py-3 px-4 text-right font-bold text-slate-800">
                    {summary.mainPersonStatus}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 text-slate-600 font-medium">Personal ALP</td>
                {scenarioComparisons.map(({ scenario, summary }) => (
                  <td key={scenario.id} className="py-3 px-4 text-right text-slate-800">
                    {formatRupiah(summary.personalAlp)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 text-slate-600 font-medium">Kualifikasi ALP</td>
                {scenarioComparisons.map(({ scenario, summary }) => (
                  <td key={scenario.id} className="py-3 px-4 text-right text-slate-800">
                    {formatRupiah(summary.qualificationAlp)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 text-slate-600 font-medium">Total Organization ALP</td>
                {scenarioComparisons.map(({ scenario, summary }) => (
                  <td key={scenario.id} className="py-3 px-4 text-right font-semibold text-slate-800">
                    {formatRupiah(summary.totalOrganizationAlp)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 text-emerald-700 font-medium">Komisi Personal / bln</td>
                {scenarioComparisons.map(({ scenario, summary }) => (
                  <td key={scenario.id} className="py-3 px-4 text-right font-semibold text-emerald-700">
                    {formatRupiah(summary.personalCommissionMonthly)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 text-sky-700 font-medium">Direct BP OR / bln</td>
                {scenarioComparisons.map(({ scenario, summary }) => (
                  <td key={scenario.id} className="py-3 px-4 text-right font-semibold text-sky-700">
                    {formatRupiah(summary.directBpOverrideMonthly)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 text-purple-700 font-medium">BP-on-BP OR / bln</td>
                {scenarioComparisons.map(({ scenario, summary }) => (
                  <td key={scenario.id} className="py-3 px-4 text-right font-semibold text-purple-700">
                    {formatRupiah(summary.bpOnBpOverrideMonthly)}
                  </td>
                ))}
              </tr>

              <tr className="bg-sky-50/50 font-bold">
                <td className="py-3 px-4 text-sky-950 text-sm">Total Estimasi Penghasilan / bln</td>
                {scenarioComparisons.map(({ scenario, summary }) => (
                  <td key={scenario.id} className="py-3 px-4 text-right text-sky-950 text-sm">
                    {formatRupiah(summary.totalMonthlyIncome)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Visual Bar Comparison Chart */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Grafik Perbandingan Penghasilan Bulanan
          </div>

          <div className="space-y-3 pt-2">
            {scenarioComparisons.map(({ scenario, summary }) => {
              const pct = (summary.totalMonthlyIncome / maxIncome) * 100;
              return (
                <div key={scenario.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="truncate max-w-xs">{scenario.name}</span>
                    <span className="text-sky-800">{formatRupiah(summary.totalMonthlyIncome)} / bln</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SaveScenarioModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        defaultMode="save_as_new"
      />
    </div>
  );
};
