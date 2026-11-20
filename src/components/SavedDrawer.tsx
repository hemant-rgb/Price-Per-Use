"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bookmark,
  Trash2,
  ExternalLink,
  Plus,
  Check,
  Award,
} from "lucide-react";
import {
  SavedComparison,
  ProductInput,
  CurrencyCode,
  ComparisonSummary,
} from "@/types/product";
import { formatCurrency } from "@/lib/format";

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedComparisons: SavedComparison[];
  onSaveCurrent: (title: string) => void;
  onLoadComparison: (saved: SavedComparison) => void;
  onDeleteComparison: (id: string) => void;
  currentProducts: ProductInput[];
  currentSummary: ComparisonSummary;
  currency: CurrencyCode;
}

export const SavedDrawer: React.FC<SavedDrawerProps> = ({
  isOpen,
  onClose,
  savedComparisons,
  onSaveCurrent,
  onLoadComparison,
  onDeleteComparison,
  currentProducts,
  currentSummary,
  currency,
}) => {
  const [saveTitle, setSaveTitle] = useState<string>("");
  const [justSaved, setJustSaved] = useState<boolean>(false);

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

  // Set default save title based on active winner
  useEffect(() => {
    if (isOpen) {
      if (currentSummary.winner) {
        setSaveTitle(`${currentSummary.winner.name} Comparison`);
      } else {
        setSaveTitle("My Comparison");
      }
    }
  }, [isOpen, currentSummary.winner]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;
    onSaveCurrent(saveTitle.trim());
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0A2540]/30 backdrop-blur-2xs transition-all">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <aside
          aria-label="Saved Comparisons Drawer"
          className="w-screen max-w-full sm:max-w-md bg-white border-l border-[#E3E8EE] shadow-[0_13px_27px_-5px_rgba(50,50,93,0.12),0_8px_16px_-8px_rgba(0,0,0,0.08)] flex flex-col z-10 animate-in slide-in-from-right duration-200"
        >
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[#E3E8EE] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#635BFF]/10 text-[#635BFF] flex items-center justify-center">
                <Bookmark className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h2 className="text-sm font-semibold text-[#0A2540]">
                Saved Comparisons
              </h2>
              <span className="text-xs text-[#697386] tabular-nums">
                ({savedComparisons.length})
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close saved drawer"
              className="p-1.5 text-[#697386] hover:text-[#0A2540] hover:bg-[#F7FAFC] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Save Current Comparison Section */}
          <div className="p-4 sm:p-5 border-b border-[#E3E8EE] bg-[#F7FAFC]">
            <h3 className="text-xs font-semibold text-[#0A2540] mb-2">
              Save Active Workspace
            </h3>
            <form onSubmit={handleSave} className="space-y-2.5">
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Name this comparison..."
                className="w-full text-xs text-[#0A2540] bg-white border border-[#E3E8EE] rounded-lg px-3 py-2 focus:outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/15 transition-all"
              />
              <button
                type="submit"
                disabled={!saveTitle.trim() || currentProducts.length === 0}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-[#635BFF] hover:bg-[#5248F5] disabled:opacity-50 rounded-lg shadow-2xs transition-colors"
              >
                {justSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved to Device!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Comparison</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List of Saved Comparisons */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {savedComparisons.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Bookmark className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" strokeWidth={1.5} />
                <h4 className="text-xs font-semibold text-[#425466]">
                  No saved comparisons yet
                </h4>
                <p className="text-[11px] text-[#697386] mt-1 leading-relaxed">
                  Save your current evaluation above to quickly retrieve it later on this device.
                </p>
              </div>
            ) : (
              savedComparisons.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 bg-white border border-[#E3E8EE] hover:border-[#CBD5E1] rounded-xl shadow-2xs transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#0A2540] leading-snug truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-[#697386] mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        • {item.products.length} options
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteComparison(item.id)}
                      aria-label={`Delete comparison "${item.title}"`}
                      className="p-1 text-[#697386] hover:text-[#E25950] hover:bg-[#FEF2F2] rounded transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Best Value readout */}
                  {item.winnerName && (
                    <div className="flex items-center justify-between text-[11px] bg-[#F7FAFC] px-2.5 py-1.5 rounded-lg border border-[#E3E8EE]/60">
                      <span className="text-[#425466] flex items-center gap-1 truncate max-w-[150px]">
                        <Award className="w-3 h-3 text-[#059669]" />
                        {item.winnerName}
                      </span>
                      <span className="font-semibold text-[#059669] tabular-nums">
                        {formatCurrency(item.winnerCostPerUse, item.currency)} / use
                      </span>
                    </div>
                  )}

                  {/* Action */}
                  <button
                    type="button"
                    onClick={() => {
                      onLoadComparison(item);
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#0A2540] bg-[#F7FAFC] hover:bg-[#F1F5F9] border border-[#E3E8EE] rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-[#635BFF]" />
                    <span>Load This Comparison</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[#E3E8EE] bg-white text-center text-[11px] text-[#94A3B8]">
            Comparisons persist in your browser’s localStorage.
          </div>
        </aside>
      </div>
    </div>
  );
};
