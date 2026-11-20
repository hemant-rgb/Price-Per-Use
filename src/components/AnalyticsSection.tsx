"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingDown,
  Table,
  Check,
} from "lucide-react";
import {
  ProductCalculations,
  ComparisonSummary,
  CurrencyCode,
} from "@/types/product";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

interface AnalyticsSectionProps {
  summary: ComparisonSummary;
  currency: CurrencyCode;
}

type MetricTab = "cpu" | "netCost" | "monthlyCost";

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  summary,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<MetricTab>("cpu");

  const { items, breakEven, isValid } = summary;

  if (!isValid || items.length < 2) {
    return null;
  }

  // Find max value for bar scaling depending on active tab
  const getMetricValue = (item: ProductCalculations, tab: MetricTab): number => {
    switch (tab) {
      case "cpu":
        return item.costPerUse !== null ? Math.max(0, item.costPerUse) : 0;
      case "netCost":
        return Math.max(0, item.netCost);
      case "monthlyCost":
        return item.monthlyCost !== null ? Math.max(0, item.monthlyCost) : 0;
    }
  };

  const getMetricDisplay = (item: ProductCalculations, tab: MetricTab): string => {
    switch (tab) {
      case "cpu":
        return `${formatCurrency(item.costPerUse, currency)} / use`;
      case "netCost":
        return formatCurrency(item.netCost, currency, { showDecimals: false });
      case "monthlyCost":
        return item.monthlyCost !== null
          ? `${formatCurrency(item.monthlyCost, currency, { showDecimals: false })} / mo`
          : "—";
    }
  };

  const maxVal = Math.max(...items.map((i) => getMetricValue(i, activeTab)), 1);

  return (
    <section className="mt-8 sm:mt-10 space-y-5 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#E3E8EE]">
        <div>
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-[#0A2540] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#635BFF]" strokeWidth={1.75} />
            <span>Value & Ownership Analytics</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-[#697386] mt-0.5">
            Cross-product cost amortizations, break-even crossover points, and complete financial matrices.
          </p>
        </div>
      </div>

      {/* Card 1: Visual Comparison Bars */}
      <div className="bg-white rounded-xl border border-[#E3E8EE] p-4 sm:p-5 lg:p-6 shadow-[0_2px_5px_-1px_rgba(50,50,93,0.05),0_1px_3px_-1px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#0A2540]">
              Visual Cost Comparison
            </h3>
            <p className="text-[11px] sm:text-xs text-[#697386]">
              Compare relative costs side by side. Lower is better.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="grid grid-cols-3 sm:inline-flex rounded-lg p-0.5 bg-[#F7FAFC] border border-[#E3E8EE] w-full sm:w-auto text-center">
            <button
              type="button"
              onClick={() => setActiveTab("cpu")}
              className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all ${
                activeTab === "cpu"
                  ? "bg-white text-[#635BFF] shadow-2xs font-semibold"
                  : "text-[#697386] hover:text-[#0A2540]"
              }`}
            >
              Cost / Use
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("netCost")}
              className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all ${
                activeTab === "netCost"
                  ? "bg-white text-[#635BFF] shadow-2xs font-semibold"
                  : "text-[#697386] hover:text-[#0A2540]"
              }`}
            >
              Net Cost
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("monthlyCost")}
              className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all ${
                activeTab === "monthlyCost"
                  ? "bg-white text-[#635BFF] shadow-2xs font-semibold"
                  : "text-[#697386] hover:text-[#0A2540]"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Horizontal Bars */}
        <div className="space-y-3.5 sm:space-y-4">
          {items.map((item) => {
            const val = getMetricValue(item, activeTab);
            const percentage = Math.min(100, Math.max(10, (val / maxVal) * 100));
            const isWinnerItem = item.isWinner;

            return (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 sm:gap-2 truncate mr-2">
                    <span className="font-medium text-[#0A2540] truncate">
                      {item.name}
                    </span>
                    {isWinnerItem && (
                      <span className="shrink-0 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#ECFDF5] text-[#0E7452] border border-[#A7F3D0]">
                        Best Value
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-[#0A2540] tabular-nums shrink-0">
                    {getMetricDisplay(item, activeTab)}
                  </span>
                </div>

                {/* Bar Container */}
                <div className="w-full h-6 sm:h-7 bg-[#F7FAFC] rounded-lg p-1 border border-[#E3E8EE]/70 overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full rounded-md transition-all duration-500 ease-out flex items-center justify-end px-2 ${
                      isWinnerItem
                        ? "bg-[#059669] text-white"
                        : "bg-[#635BFF]/80 text-white"
                    }`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-medium opacity-90 tabular-nums">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 2: Break-Even Crossover Analysis */}
      {breakEven && (
        <div className="bg-white rounded-xl border border-[#E3E8EE] p-4 sm:p-5 lg:p-6 shadow-[0_2px_5px_-1px_rgba(50,50,93,0.05),0_1px_3px_-1px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#F7FAFC] border border-[#E3E8EE] flex items-center justify-center text-[#635BFF] shrink-0 mt-0.5">
              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-semibold text-[#0A2540]">
                  Break-Even Crossover Analysis
                </h3>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#697386]">
                  Amortization Insight
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#425466] mt-1 leading-relaxed">
                {breakEven.explanation}
              </p>

              {/* Threshold Highlight Box */}
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-[#F7FAFC] rounded-lg border border-[#E3E8EE]">
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-[#697386]">
                    Upfront Delta
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#0A2540] tabular-nums mt-0.5">
                    {breakEven.upfrontCostDelta > 0
                      ? `+${formatCurrency(breakEven.upfrontCostDelta, currency, { showDecimals: false })}`
                      : "Cheaper Upfront"}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-[#697386]">
                    Crossover Threshold
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#635BFF] tabular-nums mt-0.5">
                    {breakEven.breakEvenUses > 1
                      ? `${formatNumber(breakEven.breakEvenUses)} uses`
                      : "Day 1 (Immediate)"}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-semibold text-[#697386]">
                    Lifetime Savings
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#059669] tabular-nums mt-0.5">
                    {formatPercent(breakEven.savingsPercent, 0)} per use
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card 3: Detailed Financial Matrix Table */}
      <div className="bg-white rounded-xl border border-[#E3E8EE] p-4 sm:p-5 lg:p-6 shadow-[0_2px_5px_-1px_rgba(50,50,93,0.05),0_1px_3px_-1px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#0A2540] flex items-center gap-2">
              <Table className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#697386]" />
              <span>Complete Financial Matrix</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[#697386]">
              Side-by-side component breakdown across upfront costs, maintenance, and usage rates.
            </p>
          </div>
          <span className="text-[10px] text-[#697386] sm:hidden bg-[#F7FAFC] px-2 py-0.5 rounded border border-[#E3E8EE]">
            Swipe table horizontally →
          </span>
        </div>

        {/* Responsive Table Container with Sticky Header Column on Mobile */}
        <div className="overflow-x-auto -mx-4 sm:-mx-5 lg:-mx-6 px-4 sm:px-5 lg:px-6">
          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E3E8EE] text-[#697386]">
                <th className="py-2.5 pr-4 font-medium w-44 sm:w-48 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#E3E8EE]">
                  Financial Metric
                </th>
                {items.map((item) => (
                  <th
                    key={item.id}
                    className={`py-2.5 px-3 sm:px-4 font-semibold ${
                      item.isWinner
                        ? "text-[#059669] bg-[#ECFDF5]/30"
                        : "text-[#0A2540]"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[130px] sm:max-w-none">{item.name}</span>
                      {item.isWinner && (
                        <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EE]/70">
              <tr className="hover:bg-[#F7FAFC]/60 transition-colors">
                <td className="py-2.5 pr-4 text-[#425466] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#E3E8EE]">
                  Purchase Price (P)
                </td>
                {items.map((item) => (
                  <td
                    key={item.id}
                    className={`py-2.5 px-3 sm:px-4 font-medium text-[#0A2540] tabular-nums ${
                      item.isWinner ? "bg-[#ECFDF5]/20 font-semibold" : ""
                    }`}
                  >
                    {formatCurrency(item.price, currency, { showDecimals: false })}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#F7FAFC]/60 transition-colors">
                <td className="py-2.5 pr-4 text-[#425466] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#E3E8EE]">
                  Maintenance & Repairs (M)
                </td>
                {items.map((item) => (
                  <td
                    key={item.id}
                    className={`py-2.5 px-3 sm:px-4 text-[#425466] tabular-nums ${
                      item.isWinner ? "bg-[#ECFDF5]/20" : ""
                    }`}
                  >
                    {formatCurrency(item.totalMaintenance, currency, {
                      showDecimals: false,
                    })}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#F7FAFC]/60 transition-colors">
                <td className="py-2.5 pr-4 text-[#425466] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#E3E8EE]">
                  Resale Value (R)
                </td>
                {items.map((item) => (
                  <td
                    key={item.id}
                    className={`py-2.5 px-3 sm:px-4 text-[#425466] tabular-nums ${
                      item.isWinner ? "bg-[#ECFDF5]/20" : ""
                    }`}
                  >
                    {item.resaleValue > 0
                      ? `-${formatCurrency(item.resaleValue, currency, { showDecimals: false })}`
                      : "—"}
                  </td>
                ))}
              </tr>

              <tr className="bg-[#F7FAFC]/50 hover:bg-[#F7FAFC] transition-colors font-semibold">
                <td className="py-2.5 pr-4 text-[#0A2540] sticky left-0 bg-[#F7FAFC] z-10 shadow-[1px_0_0_0_#E3E8EE]">
                  Net Ownership Cost
                </td>
                {items.map((item) => (
                  <td
                    key={item.id}
                    className={`py-2.5 px-3 sm:px-4 text-[#0A2540] tabular-nums ${
                      item.isWinner ? "bg-[#ECFDF5]/40 text-[#0E7452]" : ""
                    }`}
                  >
                    {formatCurrency(item.netCost, currency, { showDecimals: false })}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#F7FAFC]/60 transition-colors">
                <td className="py-2.5 pr-4 text-[#425466] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#E3E8EE]">
                  Total Expected Uses (U)
                </td>
                {items.map((item) => (
                  <td
                    key={item.id}
                    className={`py-2.5 px-3 sm:px-4 text-[#0A2540] tabular-nums ${
                      item.isWinner ? "bg-[#ECFDF5]/20" : ""
                    }`}
                  >
                    {item.totalUses > 0 ? `${formatNumber(item.totalUses)} uses` : "—"}
                  </td>
                ))}
              </tr>

              <tr className="bg-[#F7FAFC]/70 hover:bg-[#F7FAFC] transition-colors border-t border-[#E3E8EE]">
                <td className="py-3 pr-4 font-bold text-[#0A2540] sticky left-0 bg-[#F7FAFC] z-10 shadow-[1px_0_0_0_#E3E8EE]">
                  Cost Per Use
                </td>
                {items.map((item) => (
                  <td
                    key={item.id}
                    className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm tabular-nums ${
                      item.isWinner
                        ? "bg-[#ECFDF5]/60 text-[#059669]"
                        : "text-[#0A2540]"
                    }`}
                  >
                    {formatCurrency(item.costPerUse, currency)}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#F7FAFC]/60 transition-colors">
                <td className="py-2.5 pr-4 text-[#425466] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#E3E8EE]">
                  Monthly Ownership Cost
                </td>
                {items.map((item) => (
                  <td
                    key={item.id}
                    className={`py-2.5 px-3 sm:px-4 text-[#425466] tabular-nums ${
                      item.isWinner ? "bg-[#ECFDF5]/20 font-medium" : ""
                    }`}
                  >
                    {formatCurrency(item.monthlyCost, currency, {
                      showDecimals: false,
                    })}
                  </td>
                ))}
              </tr>

              <tr className="hover:bg-[#F7FAFC]/60 transition-colors">
                <td className="py-2.5 pr-4 text-[#425466] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#E3E8EE]">
                  Yearly Ownership Cost
                </td>
                {items.map((item) => (
                  <td
                    key={item.id}
                    className={`py-2.5 px-3 sm:px-4 text-[#425466] tabular-nums ${
                      item.isWinner ? "bg-[#ECFDF5]/20 font-medium" : ""
                    }`}
                  >
                    {formatCurrency(item.yearlyCost, currency, {
                      showDecimals: false,
                    })}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
