"use client";

import React, { useState, useEffect } from "react";
import { useSimulator } from "../SimulatorContext";
import { X, Save, Copy, CheckCircle2, BookmarkPlus } from "lucide-react";

interface SaveScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "save_current" | "save_as_new";
}

export const SaveScenarioModal: React.FC<SaveScenarioModalProps> = ({
  isOpen,
  onClose,
  defaultMode = "save_as_new",
}) => {
  const {
    activeScenario,
    saveActiveScenarioDetails,
    saveActiveScenarioAsNew,
  } = useSimulator();

  const [mode, setMode] = useState<"save_current" | "save_as_new">(defaultMode);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (activeScenario) {
      if (defaultMode === "save_as_new") {
        setName(`${activeScenario.name} (Simpanan Baru)`);
        setDescription(activeScenario.description || "");
      } else {
        setName(activeScenario.name);
        setDescription(activeScenario.description || "");
      }
      setMode(defaultMode);
      setIsSuccess(false);
    }
  }, [activeScenario, defaultMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (mode === "save_as_new") {
      saveActiveScenarioAsNew(name.trim(), description.trim());
    } else {
      saveActiveScenarioDetails(name.trim(), description.trim());
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <BookmarkPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Simpan Skenario Simulasi
              </h3>
              <p className="text-xs text-slate-500">
                Simpan konfigurasi dan seluruh buku besar transaksi ke penyimpanan lokal
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
          {/* Mode Switch Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("save_as_new");
                if (name === activeScenario?.name) {
                  setName(`${activeScenario.name} (Simpanan Baru)`);
                }
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === "save_as_new"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Simpan Sebagai Baru</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("save_current");
                setName(activeScenario?.name || "");
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === "save_current"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Timpa Skenario Aktif</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Skenario <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rencana Tim Q1 2026"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi / Catatan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan strategi, target omzet, atau asumsi mitra..."
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Skenario berhasil disimpan!</span>
            </div>
          )}

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
              disabled={isSuccess || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{mode === "save_as_new" ? "Simpan Skenario Baru" : "Simpan Perubahan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
