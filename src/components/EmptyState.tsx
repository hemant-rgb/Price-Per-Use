"use client";

import React from "react";
import { PlusCircle, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  onLoadDefault: () => void;
  onAddProduct: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onLoadDefault,
  onAddProduct,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-dashed border-[#CBD5E1] p-10 sm:p-14 text-center shadow-xs">
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-[#F7FAFC] border border-[#E3E8EE] flex items-center justify-center text-[#635BFF] mb-4">
          <RotateCcw className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-[#0A2540]">
          No products currently in comparison
        </h3>
        <p className="text-xs sm:text-sm text-[#425466] mt-1.5 mb-6 leading-relaxed">
          Start by loading the classic Shoe Benchmark or add your first blank option to calculate cost-per-use.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onLoadDefault}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#635BFF] hover:bg-[#5248F5] rounded-lg shadow-xs transition-colors"
          >
            Load Shoe Benchmark
          </button>
          <button
            type="button"
            onClick={onAddProduct}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-[#0A2540] bg-[#F7FAFC] hover:bg-[#F1F5F9] border border-[#E3E8EE] rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#697386]" />
            <span>Add Custom Option</span>
          </button>
        </div>
      </div>
    </div>
  );
};
