"use client";

import React from "react";
import { CheckCircle2, TrendingDown, Info } from "lucide-react";
import { ComparisonSummary, CurrencyCode } from "@/types/product";
import { formatCurrency, formatPercent } from "@/lib/format";

interface HeroSummaryBarProps {
  summary: ComparisonSummary;
  currency: CurrencyCode;
}

export const HeroSummaryBar: React.FC<HeroSummaryBarProps> = ({
  summary,
  currency,
}) => {
  const { winner, runnersUp, savingsPercent, breakEven, isValid, tiedWinners } = summary;

  if (!isValid || !winner) {
    return (
      <div className="w-full bg-white rounded-xl border border-[#E3E8EE] p-4 sm:p-5 shadow-[0_2px_5px_-1px_rgba(50,50,93,0.05),0_1px_3px_-1px_rgba(0,0,0,0.04)] mb-5 sm:mb-6 transition-all">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F7FAFC] border border-[#E3E8EE] flex items-center justify-center text-[#697386] shrink-0">
            <Info className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-medium text-[#0A2540]">
              Compare at least 2 options to evaluate cost-per-use
            </h2>
            <p className="text-[11px] sm:text-xs text-[#697386] mt-0.5 leading-relaxed">
              Enter the purchase price and expected usage or lifespan for each product. Your live verdict and break-even crossover will calculate automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isTied = tiedWinners.length > 1;
  const competitor = runnersUp.length > 0 ? runnersUp[0] : null;

  return (
    <div className="w-full bg-white rounded-xl border border-[#A7F3D0] p-4 sm:p-5 shadow-[0_2px_5px_-1px_rgba(50,50,93,0.05),0_1px_3px_-1px_rgba(0,0,0,0.04)] mb-5 sm:mb-6 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4">
        {/* Left Verdict Section */}
        <div className="flex items-start gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] shrink-0 mt-0.5 sm:mt-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#0E7452] border border-[#A7F3D0]">
                {isTied ? "Tied Best Value" : "Best Value Verdict"}
              </span>
              <span className="text-[11px] text-[#697386]">
                {summary.items.length} options evaluated
              </span>
            </div>

            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-[#0A2540] tracking-tight mt-1 leading-snug">
              <span className="text-[#059669]">{winner.name}</span> is the most economical choice at{" "}
              <span className="tabular-nums text-[#0A2540] font-bold">
                {formatCurrency(winner.costPerUse, currency)}
              </span>{" "}
              <span className="text-xs sm:text-sm font-normal text-[#697386]">/ use</span>
            </h2>

            {savingsPercent !== null && savingsPercent > 0 && competitor && (
              <p className="text-[11px] sm:text-xs text-[#425466] mt-1 flex items-center gap-1.5 flex-wrap leading-relaxed">
                <span className="inline-flex items-center text-[#059669] font-medium">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" strokeWidth={1.75} />
                  {formatPercent(savingsPercent, 0)} lower cost per use
                </span>
                <span>compared to the highest-cost option.</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Break-Even Callout */}
        {breakEven && (
          <div className="lg:max-w-md w-full bg-[#F7FAFC] border border-[#E3E8EE] rounded-lg p-3 sm:p-3.5 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#0A2540] mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" />
              <span>Break-Even Crossover</span>
            </div>
            <p className="text-xs text-[#425466] leading-relaxed">
              {breakEven.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
