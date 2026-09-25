"use client";

import React, { useMemo } from "react";
import { useSimulator } from "../SimulatorContext";
import { formatRupiah } from "../../lib/utils/currency";
import { AlpEvent, PromotionEvent } from "../../lib/business/types";
import {
  Calendar,
  ShieldCheck,
  TrendingUp,
  Coins,
  Award,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

type UnifiedTimelineItem =
  | { type: "ALP"; date: string; data: AlpEvent }
  | { type: "PROMOTION"; date: string; data: PromotionEvent };

export const TimelineView: React.FC = () => {
  const { activeScenario } = useSimulator();

  const peopleMap = useMemo(() => {
    const map = new Map<string, string>();
    activeScenario.people.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [activeScenario]);

  // Combine ALP events and promotion events into a chronological stream
  const timelineItems: UnifiedTimelineItem[] = useMemo(() => {
    const items: UnifiedTimelineItem[] = [
      ...activeScenario.alpEvents.map((e) => ({
        type: "ALP" as const,
        date: e.date,
        data: e,
      })),
      ...activeScenario.promotionEvents.map((p) => ({
        type: "PROMOTION" as const,
        date: p.date,
        data: p,
      })),
    ];

    // Sort chronologically
    return items.sort((a, b) => a.date.localeCompare(b.date));
  }, [activeScenario]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-600" />
          Kronologi Peristiwa & Buku Besar Transaksi (Ledger Timeline)
        </h3>
        <p className="text-xs text-slate-500">
          Setiap produksi ALP tercatat secara kekal dengan status kontekstual saat peristiwa berlangsung
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {timelineItems.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Belum ada peristiwa dalam timeline skenario ini.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
            {timelineItems.map((item, index) => {
              if (item.type === "PROMOTION") {
                const promo = item.data;
                const personName = peopleMap.get(promo.personId) || promo.personId;
                return (
                  <div key={promo.id} className="relative">
                    {/* Circle icon on line */}
                    <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>

                    <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 shadow-2xs space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-900">
                            PROMOSI STATUS KE BP
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-800">
                            Promosi
                          </span>
                        </div>
                        <span className="text-xs text-purple-700 font-medium">
                          {promo.date}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-purple-950">
                        {personName} resmi dipromosikan dari BE menjadi BP!
                      </p>
                      {promo.notes && (
                        <p className="text-[11px] text-purple-700 italic">
                          {promo.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }

              // ALP Event
              const event = item.data;
              const producerName = peopleMap.get(event.personId) || event.personId;
              const isMainPerson = event.personId === activeScenario.mainPerson.id;

              return (
                <div key={event.id} className="relative">
                  {/* Circle icon on line */}
                  <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-xs ${
                    event.classification === "PERSONAL"
                      ? "bg-emerald-500 text-white"
                      : event.classification === "DIRECT_BP_OVERRIDE"
                      ? "bg-sky-500 text-white"
                      : event.classification === "BP_ON_BP"
                      ? "bg-purple-500 text-white"
                      : "bg-slate-400 text-white"
                  }`}>
                    {event.classification === "PERSONAL" ? (
                      <Coins className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors shadow-2xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {producerName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          event.classification === "PERSONAL"
                            ? "bg-emerald-100 text-emerald-800"
                            : event.classification === "DIRECT_BP_OVERRIDE"
                            ? "bg-sky-100 text-sky-800"
                            : event.classification === "BP_ON_BP"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {event.classification === "PERSONAL"
                            ? "Personal"
                            : event.classification === "DIRECT_BP_OVERRIDE"
                            ? "Direct BP OR"
                            : event.classification === "BP_ON_BP"
                            ? "BP-on-BP"
                            : "No Overriding (0%)"}
                        </span>
                        {event.isInitialQualification && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            Kualifikasi Awal
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-slate-400 font-medium">
                        {event.date}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-base font-bold text-slate-900">
                        Produksi ALP: {formatRupiah(event.amount)}
                      </span>
                    </div>

                    {/* Status at event snapshot */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                      <span>Status Produser: <strong>{event.producerStatusAtEvent}</strong></span>
                      {event.parentStatusAtEvent && (
                        <>
                          <span>•</span>
                          <span>Status Upline saat itu: <strong>{event.parentStatusAtEvent}</strong></span>
                        </>
                      )}
                      {event.rateApplied > 0 && (
                        <>
                          <span>•</span>
                          <span>Rate Upline: <strong>{(event.rateApplied * 100).toFixed(4).replace(".", ",")}%</strong></span>
                        </>
                      )}
                    </div>

                    {/* Impact on Income */}
                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                      {isMainPerson ? (
                        <div className="text-emerald-700 font-semibold">
                          Komisi Personal Anda: +{formatRupiah(event.monthlyIncomeToProducer)}/bulan
                        </div>
                      ) : (
                        <>
                          <div className="text-slate-600">
                            Komisi ke Produser ({producerName}): {formatRupiah(event.monthlyIncomeToProducer)}/bln
                          </div>
                          <div className={`font-bold ${
                            event.monthlyIncomeToParent > 0 ? "text-sky-700" : "text-slate-400"
                          }`}>
                            Overriding ke Anda: +{formatRupiah(event.monthlyIncomeToParent)}/bulan
                          </div>
                        </>
                      )}
                    </div>

                    {event.formulaExplanation && (
                      <p className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-1.5 font-mono">
                        {event.formulaExplanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
