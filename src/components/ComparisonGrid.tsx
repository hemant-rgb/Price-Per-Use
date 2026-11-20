"use client";

import React from "react";
import { Plus, RotateCcw } from "lucide-react";
import { ProductInput, ProductCalculations, CurrencyCode } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ComparisonGridProps {
  products: ProductInput[];
  calculations: ProductCalculations[];
  currency: CurrencyCode;
  onUpdateProduct: (index: number, updated: ProductInput) => void;
  onDuplicateProduct: (product: ProductInput) => void;
  onRemoveProduct: (id: string) => void;
  onAddProduct: () => void;
  onResetToDefault: () => void;
}

export const ComparisonGrid: React.FC<ComparisonGridProps> = ({
  products,
  calculations,
  currency,
  onUpdateProduct,
  onDuplicateProduct,
  onRemoveProduct,
  onAddProduct,
  onResetToDefault,
}) => {
  const canAddMore = products.length < 4;

  // Responsive grid class configuration
  const getGridClasses = (count: number) => {
    switch (count) {
      case 1:
        return "grid-cols-1 max-w-lg mx-auto";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  };

  return (
    <section className="w-full">
      {/* Grid Sub-Header with controls */}
      <div className="flex items-center justify-between gap-2 mb-3.5 sm:mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#425466]">
            Comparison Workspace
          </h2>
          <span className="text-[11px] sm:text-xs text-[#697386] tabular-nums">
            ({products.length}/4)
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onResetToDefault}
            className="flex items-center gap-1 text-[11px] sm:text-xs text-[#697386] hover:text-[#0A2540] transition-colors py-1 px-2 rounded-md hover:bg-[#F1F5F9]"
            title="Reset to default shoe benchmark"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="inline">Reset</span>
          </button>

          {canAddMore && (
            <button
              type="button"
              onClick={onAddProduct}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-[#635BFF] hover:text-[#5248F5] bg-white hover:bg-[#F7FAFC] border border-[#E3E8EE] hover:border-[#635BFF]/40 rounded-lg shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Option</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className={`grid gap-4 sm:gap-5 lg:gap-6 ${getGridClasses(products.length)}`}>
        {products.map((product, index) => {
          const calc = calculations.find((c) => c.id === product.id) || {
            id: product.id,
            name: product.name,
            price: 0,
            totalMaintenance: 0,
            grossCost: 0,
            resaleValue: 0,
            resaleExceedsCost: false,
            netCost: 0,
            totalMonths: null,
            totalUses: 0,
            costPerUse: null,
            monthlyCost: null,
            yearlyCost: null,
            isWinner: false,
            isTied: false,
          };

          return (
            <ProductCard
              key={product.id}
              product={product}
              calculations={calc}
              currency={currency}
              index={index}
              totalProducts={products.length}
              onUpdate={(updated) => onUpdateProduct(index, updated)}
              onDuplicate={onDuplicateProduct}
              onRemove={onRemoveProduct}
            />
          );
        })}
      </div>
    </section>
  );
};
