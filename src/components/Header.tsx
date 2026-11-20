"use client";

import React from "react";
import { Scale, Bookmark, Share2 } from "lucide-react";
import { CurrencyCode } from "@/types/product";
import { CURRENCIES } from "@/lib/format";
import { PRESETS } from "@/lib/presets";

interface HeaderProps {
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
  onOpenSavedDrawer: () => void;
  onOpenReportModal: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  onSelectPreset,
  onReset,
  onOpenSavedDrawer,
  onOpenReportModal,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#E3E8EE] transition-all">
      <div className="max-w-[1160px] mx-auto px-3 sm:px-6 lg:px-8 min-h-16 py-2.5 flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#635BFF] flex items-center justify-center text-white shadow-2xs">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
          </div>
          <div>
            <span className="font-semibold text-sm sm:text-base text-[#0A2540] tracking-tight">
              PricePerUse
            </span>
            <p className="hidden md:block text-[11px] text-[#697386] leading-none mt-0.5">
              Cost of ownership & value calculator
            </p>
          </div>
        </div>

        {/* Actions & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto sm:ml-0">
          {/* Preset Selector */}
          <div className="relative">
            <label htmlFor="preset-select" className="sr-only">
              Select Preset
            </label>
            <select
              id="preset-select"
              aria-label="Load a comparison preset"
              onChange={(e) => {
                if (e.target.value === "reset") {
                  onReset();
                } else if (e.target.value) {
                  onSelectPreset(e.target.value);
                }
                // reset select to default placeholder after picking
                e.target.value = "";
              }}
              defaultValue=""
              className="text-xs font-medium text-[#0A2540] bg-[#F7FAFC] hover:bg-[#F1F5F9] border border-[#E3E8EE] rounded-lg px-2 sm:px-2.5 py-1.5 focus:outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/15 transition-colors cursor-pointer max-w-[105px] sm:max-w-[170px] truncate"
            >
              <option value="" disabled>
                Presets...
              </option>
              {PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
              <option value="reset">↺ Start Blank</option>
            </select>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center bg-[#F7FAFC] border border-[#E3E8EE] rounded-lg p-0.5">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const active = currency === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onCurrencyChange(code)}
                  aria-label={`Switch currency to ${code}`}
                  className={`px-1.5 sm:px-2 py-1 text-xs font-medium rounded-md transition-all tabular-nums ${
                    active
                      ? "bg-white text-[#635BFF] shadow-2xs border border-[#E3E8EE]"
                      : "text-[#425466] hover:text-[#0A2540]"
                  }`}
                >
                  <span>{CURRENCIES[code].symbol}</span>
                  <span className="hidden lg:inline ml-1">{code}</span>
                </button>
              );
            })}
          </div>

          {/* Saved Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenSavedDrawer}
            aria-label="View saved comparisons"
            className="relative flex items-center justify-center gap-1 text-xs font-medium text-[#425466] hover:text-[#0A2540] bg-[#F7FAFC] hover:bg-[#F1F5F9] border border-[#E3E8EE] rounded-lg px-2 sm:px-2.5 py-1.5 focus:outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/15 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#635BFF] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {savedCount}
              </span>
            )}
          </button>

          {/* Report & Share Primary CTA */}
          <button
            type="button"
            onClick={onOpenReportModal}
            aria-label="Generate comparison report and share"
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#635BFF] hover:bg-[#5248F5] active:bg-[#483DE8] rounded-lg px-2.5 sm:px-3 py-1.5 shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="inline sm:hidden">Report</span>
            <span className="hidden sm:inline">Report & Share</span>
          </button>
        </div>
      </div>
    </header>
  );
};
