"use client";

import React, { useState, useEffect } from "react";
import { formatRupiah, parseRupiahInput } from "../../lib/utils/currency";

interface CurrencyInputProps {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  showChips?: boolean;
  min?: number;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  label,
  helperText,
  error,
  placeholder = "Contoh: 100jt atau 100.000.000",
  showChips = true,
  min = 0,
  disabled = false,
}) => {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    setText(value > 0 ? value.toLocaleString("id-ID") : "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);
    const parsed = parseRupiahInput(raw);
    onChange(Math.max(min, parsed));
  };

  const handleChipClick = (delta: number) => {
    const newVal = Math.max(min, (value || 0) + delta);
    onChange(newVal);
    setText(newVal.toLocaleString("id-ID"));
  };

  const handleSetExact = (val: number) => {
    onChange(val);
    setText(val.toLocaleString("id-ID"));
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
          <span>{label}</span>
          {value > 0 && (
            <span className="text-primary-700 font-medium">
              {formatRupiah(value)}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-semibold text-sm">
          Rp
        </div>
        <input
          type="text"
          disabled={disabled}
          value={text}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-400 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-300 focus:border-primary-500 focus:ring-primary-100"
          }`}
        />
      </div>

      {showChips && !disabled && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {[10_000_000, 25_000_000, 50_000_000, 100_000_000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleChipClick(amt)}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 transition-colors"
            >
              +{amt / 1_000_000}jt
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSetExact(0)}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-200 transition-colors ml-auto"
          >
            Reset 0
          </button>
        </div>
      )}

      {error ? (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
