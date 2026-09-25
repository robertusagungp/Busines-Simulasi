"use client";

import React, { useState } from "react";
import { useSimulator } from "../SimulatorContext";
import { OrganizationNode, AlpEvent, PromotionEvent } from "../../lib/business/types";
import { formatRupiah, formatCompactRupiah } from "../../lib/utils/currency";
import {
  Users,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
} from "lucide-react";

export const OrganizationView: React.FC = () => {
  const { organizationTree, activeScenario } = useSimulator();
  const [selectedNode, setSelectedNode] = useState<OrganizationNode | null>(null);

  if (!organizationTree) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        Organisasi belum tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            Bagan Struktur Organisasi Bisnis
          </h3>
          <p className="text-xs text-slate-500">
            Klik pada salah satu mitra untuk membuka panel audit transaksi & kontribusi pendapatan
          </p>
        </div>
      </div>

      {/* Main Tree Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Hierarchy Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto min-h-[480px]">
          <div className="min-w-[500px] flex flex-col items-center py-4">
            <TreeNode
              node={organizationTree}
              isRoot={true}
              selectedId={selectedNode?.person.id}
              onSelect={(node) => setSelectedNode(node)}
            />
          </div>
        </div>

        {/* Side Detail Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {selectedNode ? (
            <NodeDetailDrawer
              node={selectedNode}
              events={activeScenario.alpEvents.filter((e) => e.personId === selectedNode.person.id)}
              promotions={activeScenario.promotionEvents.filter((p) => p.personId === selectedNode.person.id)}
              onClose={() => setSelectedNode(null)}
            />
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-semibold text-slate-600">
                Pilih Anggota Organisasi
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Klik kartu anggota di bagan sebelah kiri untuk melihat riwayat transaksi dan kontribusi overriding bagi Anda.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TreeNodeProps {
  node: OrganizationNode;
  isRoot?: boolean;
  selectedId?: string;
  onSelect: (node: OrganizationNode) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  isRoot = false,
  selectedId,
  onSelect,
}) => {
  const isSelected = selectedId === node.person.id;
  const isBp = node.status === "BP";

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        onClick={() => onSelect(node)}
        className={`w-64 p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
          isSelected
            ? "border-sky-600 bg-sky-50/70 shadow-md ring-2 ring-sky-200"
            : isRoot
            ? "border-slate-800 bg-slate-900 text-white hover:border-slate-700"
            : "border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
            isRoot
              ? "bg-slate-800 text-sky-300"
              : isBp
              ? "bg-purple-100 text-purple-700"
              : "bg-sky-100 text-sky-700"
          }`}>
            {node.status}
          </span>
          {isRoot && (
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Agen Utama
            </span>
          )}
        </div>

        <div className={`font-bold text-sm truncate ${isRoot ? "text-white" : "text-slate-900"}`}>
          {node.person.name}
        </div>

        <div className="mt-3 pt-2 border-t border-slate-200/40 text-xs space-y-1">
          <div className="flex justify-between items-center">
            <span className={isRoot ? "text-slate-400" : "text-slate-500"}>Personal ALP:</span>
            <span className={`font-bold ${isRoot ? "text-white" : "text-slate-800"}`}>
              {formatCompactRupiah(node.personalAlp)}
            </span>
          </div>

          {!isRoot && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Tim ALP:</span>
              <span className="font-semibold text-slate-700">
                {formatCompactRupiah(node.teamAlp)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className={isRoot ? "text-slate-400" : "text-slate-500"}>Kumulatif ALP:</span>
            <span className={`font-bold ${isRoot ? "text-sky-300" : "text-sky-700"}`}>
              {formatCompactRupiah(node.cumulativeAlp)}
            </span>
          </div>
        </div>

        {node.promotedAt && (
          <div className={`mt-2 text-[10px] flex items-center gap-1 ${isRoot ? "text-purple-300" : "text-purple-600 font-medium"}`}>
            <ShieldCheck className="w-3 h-3" /> Promosi BP: {node.promotedAt}
          </div>
        )}
      </div>

      {/* Children branches */}
      {node.children.length > 0 && (
        <div className="flex flex-col items-center">
          {/* Vertical connecting line */}
          <div className="w-0.5 h-6 bg-slate-300" />

          {/* Children horizontal container */}
          <div className="relative flex justify-center gap-8">
            {/* Horizontal line over children */}
            {node.children.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-slate-300"
                style={{
                  left: "calc(16rem / 2)",
                  right: "calc(16rem / 2)",
                }}
              />
            )}

            {node.children.map((childNode) => (
              <div key={childNode.person.id} className="flex flex-col items-center">
                {/* Branch line into child */}
                <div className="w-0.5 h-6 bg-slate-300" />
                <TreeNode
                  node={childNode}
                  selectedId={selectedId}
                  onSelect={onSelect}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface NodeDetailDrawerProps {
  node: OrganizationNode;
  events: AlpEvent[];
  promotions: PromotionEvent[];
  onClose: () => void;
}

const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  events,
  promotions,
  onClose,
}) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{node.person.name}</h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            node.status === "BP" ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-sky-700"
          }`}>
            Status Saat Ini: {node.status}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Production & Overriding Summary */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
        <div className="font-bold text-slate-800">Ringkasan ALP & Kontribusi</div>
        <div className="flex justify-between text-slate-600">
          <span>Personal ALP:</span>
          <span className="font-bold text-slate-800">{formatRupiah(node.personalAlp)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Kumulatif ALP:</span>
          <span className="font-bold text-slate-800">{formatRupiah(node.cumulativeAlp)}</span>
        </div>

        {/* Income to Parent breakdown */}
        <div className="pt-2 border-t border-slate-200 space-y-1">
          <div className="text-[11px] font-semibold text-slate-700">
            Overriding Dihasilkan ke Upline:
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Direct BP OR (12,7875%):</span>
            <span className="font-bold text-sky-700">
              {formatRupiah(node.incomeGeneratedForParent.directBpMonthly)}/bln
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>BP-on-BP OR (4,65%):</span>
            <span className="font-bold text-purple-700">
              {formatRupiah(node.incomeGeneratedForParent.bpOnBpMonthly)}/bln
            </span>
          </div>
          {node.incomeGeneratedForParent.noOverrideAlp > 0 && (
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>ALP Historis (0% OR):</span>
              <span>{formatRupiah(node.incomeGeneratedForParent.noOverrideAlp)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Promotion Milestone */}
      {promotions.length > 0 && (
        <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs space-y-1">
          <div className="font-bold text-purple-900 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            Riwayat Promosi ke BP
          </div>
          {promotions.map((p) => (
            <div key={p.id} className="text-purple-800 text-[11px]">
              Tanggal: <span className="font-medium">{p.date}</span> (ALP pemicu: {formatRupiah(p.triggerAlpTotal)})
            </div>
          ))}
        </div>
      )}

      {/* Transaction History Ledger */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Buku Besar Transaksi ALP ({events.length})
        </div>

        {events.length === 0 ? (
          <div className="text-xs text-slate-400 italic">Belum ada transaksi.</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {events.map((e) => (
              <div
                key={e.id}
                className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs space-y-1 shadow-2xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">{formatRupiah(e.amount)}</span>
                  <span className="text-[10px] text-slate-400">{e.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                    {e.classification}
                  </span>
                  <span className="text-slate-500">
                    Rate Upline: {(e.rateApplied * 100).toFixed(4).replace(".", ",")}%
                  </span>
                </div>
                {e.monthlyIncomeToParent > 0 && (
                  <div className="text-sky-700 font-semibold text-[11px]">
                    + {formatRupiah(e.monthlyIncomeToParent)}/bln ke Upline
                  </div>
                )}
                {e.description && (
                  <p className="text-[10px] text-slate-500 italic">{e.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
