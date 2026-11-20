"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  X,
  Link2,
  Download,
  Copy,
  Printer,
  Check,
  Award,
} from "lucide-react";
import { toPng } from "html-to-image";
import {
  ComparisonSummary,
  ProductInput,
  CurrencyCode,
  ShareablePayload,
} from "@/types/product";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { generateShareUrl } from "@/lib/shareState";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductInput[];
  summary: ComparisonSummary;
  currency: CurrencyCode;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  products,
  summary,
  currency,
}) => {
  const [reportTitle, setReportTitle] = useState<string>("Product Value & Cost-Per-Use Report");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { items, winner, breakEven, savingsPercent, tiedWinners } = summary;
  const isTied = tiedWinners.length > 1;

  // 1. Copy Shareable Link
  const handleCopyLink = async () => {
    try {
      const payload: ShareablePayload = {
        version: 1,
        title: reportTitle,
        currency,
        products,
      };
      const url = generateShareUrl(payload, window.location.href);
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  // 2. Download High-DPI PNG Card
  const handleDownloadPng = async () => {
    if (!reportRef.current) return;
    setIsExportingPng(true);

    try {
      const dataUrl = await toPng(reportRef.current, {
        pixelRatio: 2,
        backgroundColor: "#FFFFFF",
        cacheBust: true,
      });

      const sanitizedName = reportTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const link = document.createElement("a");
      link.download = `priceperuse-${sanitizedName || "report"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate PNG image:", err);
    } finally {
      setIsExportingPng(false);
    }
  };

  // 3. Copy Plain Text Summary
  const handleCopyText = async () => {
    try {
      let text = `📊 PricePerUse Comparison Report: ${reportTitle}\n`;
      text += `📅 Date: ${new Date().toLocaleDateString()}\n`;
      text += `----------------------------------------\n`;

      if (winner && winner.costPerUse !== null) {
        text += `🏆 Best Value: ${winner.name} at ${formatCurrency(winner.costPerUse, currency)} / use\n`;
        if (savingsPercent !== null && savingsPercent > 0) {
          text += `📉 Delivers ${formatPercent(savingsPercent, 0)} lower cost per use vs competitors.\n`;
        }
      }

      if (breakEven) {
        text += `\n💡 Break-Even Insight:\n${breakEven.explanation}\n`;
      }

      text += `\n📋 Side-by-Side Summary:\n`;
      items.forEach((item) => {
        text += `• ${item.name}:\n`;
        text += `  - Purchase Price: ${formatCurrency(item.price, currency, { showDecimals: false })}\n`;
        text += `  - Net Cost: ${formatCurrency(item.netCost, currency, { showDecimals: false })}\n`;
        text += `  - Total Uses: ${item.totalUses > 0 ? formatNumber(item.totalUses) : "—"}\n`;
        text += `  - Cost Per Use: ${formatCurrency(item.costPerUse, currency)} / use\n`;
        if (item.monthlyCost !== null) {
          text += `  - Monthly Cost: ${formatCurrency(item.monthlyCost, currency, { showDecimals: false })} / mo\n`;
        }
      });

      text += `\nCalculated with PricePerUse (100% Client-Side Financial Utility)`;

      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error("Failed to copy text summary:", err);
    }
  };

  // 4. Print / PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0A2540]/40 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 transition-all">
      <div className="relative w-full max-w-3xl bg-white rounded-xl sm:rounded-2xl shadow-[0_13px_27px_-5px_rgba(50,50,93,0.12),0_8px_16px_-8px_rgba(0,0,0,0.08)] border border-[#E3E8EE] flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Action Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#E3E8EE] flex items-center justify-between bg-white shrink-0 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-[#0A2540]">
              Comparison Report Card
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#697386] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
              Ready to Share
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#697386] hover:text-[#0A2540] hover:bg-[#F7FAFC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button Row */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#F7FAFC] border-b border-[#E3E8EE] flex items-center gap-2 overflow-x-auto shrink-0 no-print">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0A2540] bg-white hover:bg-[#F1F5F9] border border-[#E3E8EE] rounded-lg shadow-2xs transition-colors shrink-0"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-[#059669]" />
            ) : (
              <Link2 className="w-3.5 h-3.5 text-[#635BFF]" />
            )}
            <span>{copiedLink ? "Link Copied!" : "Copy Share Link"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#635BFF] hover:bg-[#5248F5] disabled:opacity-50 rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPng ? "Generating..." : "Download PNG Card"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#425466] hover:text-[#0A2540] bg-white hover:bg-[#F1F5F9] border border-[#E3E8EE] rounded-lg shadow-2xs transition-colors shrink-0"
          >
            {copiedText ? (
              <Check className="w-3.5 h-3.5 text-[#059669]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#697386]" />
            )}
            <span>{copiedText ? "Text Copied!" : "Copy Text"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#425466] hover:text-[#0A2540] bg-white hover:bg-[#F1F5F9] border border-[#E3E8EE] rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-[#697386]" />
            <span>Print / PDF</span>
          </button>
        </div>

        {/* Scrollable Printable Report Preview */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-white">
          <div
            ref={reportRef}
            className="p-4 sm:p-6 md:p-8 bg-white border border-[#E3E8EE] rounded-xl shadow-xs space-y-5 sm:space-y-6"
          >
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 sm:pb-5 border-b border-[#E3E8EE]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#635BFF] mb-1">
                  <span>PricePerUse</span>
                  <span>•</span>
                  <span>Valuation Report</span>
                </div>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Report Title"
                  aria-label="Editable report title"
                  className="font-bold text-lg sm:text-2xl text-[#0A2540] bg-transparent border-b border-transparent hover:border-[#CBD5E1] focus:border-[#635BFF] focus:outline-none transition-colors w-full"
                />
              </div>

              <div className="text-left sm:text-right text-xs text-[#697386] shrink-0">
                <div>Generated on</div>
                <div className="font-semibold text-[#0A2540] tabular-nums">
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Verdict Callout */}
            {winner && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-start gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-[#A7F3D0] flex items-center justify-center text-[#059669] shrink-0 mt-0.5">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#0E7452]">
                    {isTied ? "Tied Best Value" : "Recommended Choice"}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-[#0A2540] mt-0.5">
                    {winner.name} delivers optimal value at{" "}
                    <span className="text-[#059669] tabular-nums font-extrabold">
                      {formatCurrency(winner.costPerUse, currency)}
                    </span>{" "}
                    per use
                  </h4>
                  {savingsPercent !== null && savingsPercent > 0 && (
                    <p className="text-xs text-[#0E7452] mt-0.5 font-medium">
                      Provides {formatPercent(savingsPercent, 0)} lower cost per use compared to the highest-cost alternative.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Break-Even Insight (if applicable) */}
            {breakEven && (
              <div className="p-3.5 sm:p-4 bg-[#F7FAFC] border border-[#E3E8EE] rounded-xl">
                <div className="text-xs font-semibold text-[#0A2540] flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#635BFF]" />
                  <span>Break-Even Crossover Analysis</span>
                </div>
                <p className="text-xs text-[#425466] leading-relaxed">
                  {breakEven.explanation}
                </p>
              </div>
            )}

            {/* Executive Metrics Table */}
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-left text-xs border-collapse min-w-[460px]">
                <thead>
                  <tr className="border-b border-[#E3E8EE] text-[#697386]">
                    <th className="py-2.5 pr-3 font-semibold">Option</th>
                    <th className="py-2.5 px-2.5 font-semibold text-right">Price</th>
                    <th className="py-2.5 px-2.5 font-semibold text-right">Net Cost</th>
                    <th className="py-2.5 px-2.5 font-semibold text-right">Total Uses</th>
                    <th className="py-2.5 px-2.5 font-bold text-right text-[#0A2540]">Cost / Use</th>
                    <th className="py-2.5 pl-2.5 font-semibold text-right">Monthly</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8EE]/70">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className={item.isWinner ? "bg-[#ECFDF5]/30 font-medium" : ""}
                    >
                      <td className="py-2.5 pr-3 text-[#0A2540]">
                        <div className="font-semibold">{item.name}</div>
                        {item.isWinner && (
                          <span className="inline-block text-[10px] text-[#059669] font-bold">
                            ★ Winner
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2.5 text-right text-[#425466] tabular-nums">
                        {formatCurrency(item.price, currency, { showDecimals: false })}
                      </td>
                      <td className="py-2.5 px-2.5 text-right text-[#0A2540] font-medium tabular-nums">
                        {formatCurrency(item.netCost, currency, { showDecimals: false })}
                      </td>
                      <td className="py-2.5 px-2.5 text-right text-[#425466] tabular-nums">
                        {item.totalUses > 0 ? formatNumber(item.totalUses) : "—"}
                      </td>
                      <td
                        className={`py-2.5 px-2.5 text-right font-bold tabular-nums text-xs sm:text-sm ${
                          item.isWinner ? "text-[#059669]" : "text-[#0A2540]"
                        }`}
                      >
                        {formatCurrency(item.costPerUse, currency)}
                      </td>
                      <td className="py-2.5 pl-2.5 text-right text-[#425466] tabular-nums">
                        {formatCurrency(item.monthlyCost, currency, {
                          showDecimals: false,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Report Watermark Footer */}
            <div className="pt-3.5 border-t border-[#E3E8EE] flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-[#94A3B8]">
              <span>Calculated with PricePerUse • 100% Client-Side Engine</span>
              <span>https://priceperuse.app</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
