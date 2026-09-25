"use client";

import React, { useState } from "react";
import { useSimulator } from "../SimulatorContext";
import { formatRupiah } from "../../lib/utils/currency";
import { BusinessRulesConfig, DEFAULT_BUSINESS_RULES } from "../../lib/business/rules";
import {
  BookOpen,
  Info,
  ShieldAlert,
  Settings,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export const RulesInspectorView: React.FC = () => {
  const { rules, updateRules } = useSimulator();

  const [isEditing, setIsEditing] = useState(false);
  const [tempRules, setTempRules] = useState<BusinessRulesConfig>({ ...rules });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    updateRules(tempRules);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    setTempRules({ ...DEFAULT_BUSINESS_RULES });
    updateRules(DEFAULT_BUSINESS_RULES);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-600" />
          Aturan Perhitungan Kompensasi Agensi
        </h3>
        <p className="text-xs text-slate-500">
          Dokumentasi formal rumus matematika, tabel keputusan matriks status, dan parameter konfigurasi bisnis
        </p>
      </div>

      {/* Decision Table (Section 8) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span>Matriks Status & Hak Overriding (Decision Table)</span>
          </h4>
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
            Kaidah Inti: Event-Based & Status-Aware
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="py-3 px-4 border-b border-slate-200 font-bold">
                  Status Upline Saat ALP Terjadi
                </th>
                <th className="py-3 px-4 border-b border-slate-200 font-bold">
                  Status Produser (Mitra) Saat ALP Terjadi
                </th>
                <th className="py-3 px-4 border-b border-slate-200 font-bold">
                  Kategori Overriding
                </th>
                <th className="py-3 px-4 border-b border-slate-200 font-bold text-right">
                  Rate Bulanan ke Upline
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">BE</td>
                <td className="py-3 px-4 text-slate-600">BE</td>
                <td className="py-3 px-4 text-slate-500">No Overriding</td>
                <td className="py-3 px-4 text-right font-bold text-slate-400">Rp 0 (0%)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800">BE</td>
                <td className="py-3 px-4 text-slate-600">BP</td>
                <td className="py-3 px-4 text-slate-500">No Overriding</td>
                <td className="py-3 px-4 text-right font-bold text-slate-400">Rp 0 (0%)</td>
              </tr>
              <tr className="bg-sky-50/40">
                <td className="py-3 px-4 font-bold text-sky-900">BP</td>
                <td className="py-3 px-4 font-semibold text-slate-700">BE</td>
                <td className="py-3 px-4 font-bold text-sky-700">Direct BP Overriding</td>
                <td className="py-3 px-4 text-right font-extrabold text-sky-700">
                  {(rules.directBpOverrideRate * 100).toFixed(4).replace(".", ",")}% / 12
                </td>
              </tr>
              <tr className="bg-purple-50/40">
                <td className="py-3 px-4 font-bold text-purple-900">BP</td>
                <td className="py-3 px-4 font-semibold text-purple-800">BP</td>
                <td className="py-3 px-4 font-bold text-purple-700">BP-on-BP Overriding</td>
                <td className="py-3 px-4 text-right font-extrabold text-purple-700">
                  {(rules.bpOnBpRate * 100).toFixed(2).replace(".", ",")}% / 12
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <strong className="font-bold">Prinsip Tidak Berlaku Surut (Non-Retroactive):</strong>
            <p className="mt-0.5 text-[11px] leading-relaxed">
              Perubahan status (misal mitra atau upline promosi menjadi BP) <strong>TIDAK PERNAH</strong> mengubah klasifikasi transaksi historis di masa lalu secara mundur. Nilai komisi dan overriding terkunci abadi sesuai status pada detik transaksi dicatatkan.
            </p>
          </div>
        </div>
      </div>

      {/* Formula Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Personal */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h4 className="font-bold text-sm text-slate-900">Komisi Personal</h4>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-800 space-y-1">
            <div className="text-slate-500 text-[10px] uppercase">Rumus:</div>
            <div>Personal ALP × 23,25% ÷ 12</div>
          </div>
          <p className="text-xs text-slate-500">
            Diterima oleh agen produser atas polis yang dihasilkannya sendiri, diilustrasikan cair selama 24 bulan berturut-turut.
          </p>
        </div>

        {/* Card 2: Direct BP OR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <h4 className="font-bold text-sm text-slate-900">Direct BP Overriding</h4>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-800 space-y-1">
            <div className="text-slate-500 text-[10px] uppercase">Rumus:</div>
            <div>Eligible ALP × 12,7875% ÷ 12</div>
          </div>
          <p className="text-xs text-slate-500">
            Diturunkan dari 23,25% × 55%. Diberikan kepada BP atas produksi baru dari mitra langsung yang masih berstatus BE.
          </p>
        </div>

        {/* Card 3: BP-on-BP */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <h4 className="font-bold text-sm text-slate-900">BP-on-BP Overriding</h4>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-800 space-y-1">
            <div className="text-slate-500 text-[10px] uppercase">Rumus:</div>
            <div>Eligible Post-BP ALP × 4,65% ÷ 12</div>
          </div>
          <p className="text-xs text-slate-500">
            Diturunkan dari 23,25% × 20%. Diberikan saat kedua belah pihak sudah resmi menjadi BP, hanya untuk ALP baru setelah promosi anak.
          </p>
        </div>
      </div>

      {/* Interactive Glossary (Section 20) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-600" />
          Glosarium Istilah Bisnis
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">ALP (Annualized Life Premium)</span>
            <p className="text-slate-500 text-[11px]">
              Premi tahunan polis asuransi jiwa yang disetahunkan sebagai basis perhitungan komisi dan target kualifikasi.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">BE (Business Executive)</span>
            <p className="text-slate-500 text-[11px]">
              Jenjang karier awal. Berhak atas komisi personal tetapi belum berhak atas overriding dari downline.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">BP (Business Partner)</span>
            <p className="text-slate-500 text-[11px]">
              Jenjang kemitraan setelah mencapai kualifikasi Rp300jt ALP. Berhak atas Direct Overriding dan BP-on-BP.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">OR (Overriding)</span>
            <p className="text-slate-500 text-[11px]">
              Hak bagi hasil kepemimpinan yang diterima upline dari volume produksi jaringan keagenannya.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">Direct BP OR</span>
            <p className="text-slate-500 text-[11px]">
              Overriding 12,7875% yang diperoleh BP dari mitra langsung yang berstatus BE.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">BP-on-BP OR</span>
            <p className="text-slate-500 text-[11px]">
              Overriding 4,65% saat mitra langsung telah menyusul promosi menjadi rekan sejawat BP.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">Kualifikasi ALP</span>
            <p className="text-slate-500 text-[11px]">
              Total volume gabungan personal + kontributor yang diakui untuk mencapai target promosi ke BP (300jt).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">Personal ALP</span>
            <p className="text-slate-500 text-[11px]">
              Volume yang murni dihasilkan dari penjualan mandiri atas nama agen bersangkutan.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Business Rule Configuration (Section 21) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-sky-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Konfigurasi Parameter Bisnis Terpusat
            </h4>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-primary-600 hover:underline"
            >
              Ubah Parameter
            </button>
          ) : (
            <button
              onClick={handleResetToDefault}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Kembalikan Bawaan
            </button>
          )}
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Parameter bisnis berhasil diperbarui dan diterapkan ke seluruh simulasi.
          </div>
        )}

        <form onSubmit={handleSaveRules} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Target Kualifikasi BP (ALP)</label>
            <input
              type="number"
              disabled={!isEditing}
              value={isEditing ? tempRules.bpQualificationALP : rules.bpQualificationALP}
              onChange={(e) =>
                setTempRules({ ...tempRules, bpQualificationALP: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:bg-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Rate Komisi Personal</label>
            <input
              type="number"
              step="0.0001"
              disabled={!isEditing}
              value={isEditing ? tempRules.personalCommissionRate : rules.personalCommissionRate}
              onChange={(e) =>
                setTempRules({ ...tempRules, personalCommissionRate: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:bg-slate-100"
            />
            <span className="text-[10px] text-slate-400">Default: 0.2325 (23.25%)</span>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Rate Direct BP Overriding</label>
            <input
              type="number"
              step="0.000001"
              disabled={!isEditing}
              value={isEditing ? tempRules.directBpOverrideRate : rules.directBpOverrideRate}
              onChange={(e) =>
                setTempRules({ ...tempRules, directBpOverrideRate: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:bg-slate-100"
            />
            <span className="text-[10px] text-slate-400">Default: 0.127875 (12.7875%)</span>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Rate BP-on-BP Overriding</label>
            <input
              type="number"
              step="0.0001"
              disabled={!isEditing}
              value={isEditing ? tempRules.bpOnBpRate : rules.bpOnBpRate}
              onChange={(e) =>
                setTempRules({ ...tempRules, bpOnBpRate: Number(e.target.value) })
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:bg-slate-100"
            />
            <span className="text-[10px] text-slate-400">Default: 0.0465 (4.65%)</span>
          </div>

          {isEditing && (
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700"
              >
                Simpan Perubahan Parameter
              </button>
            </div>
          )}
        </form>

        {/* Known Limitations Notice (Section 21 & 30) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-500" />
            Batasan Lingkup & Asumsi Aturan Bisnis (Disclaimer)
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Aplikasi simulasi ini dibangun strictly mengikuti aturan kompensasi yang telah dikonfirmasi (Skema Kualifikasi BP, Komisi Personal 23,25%, Direct BP OR 12,7875%, dan BP-on-BP OR 4,65%).
            Faktor-faktor riil polis asuransi seperti: <em>persistency rate, lapse, clawback, pembatalan dini, renewal multi-tahun, serta kedalaman generasi BP-on-BP &gt; 1 generasi</em> belum didefinisikan secara resmi pada model ini, sehingga sengaja tidak dimasukkan asumsi rekaan.
          </p>
        </div>
      </div>
    </div>
  );
};
