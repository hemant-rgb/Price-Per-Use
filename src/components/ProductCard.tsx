"use client";

import React, { useState } from "react";
import {
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Award,
  Wrench,
} from "lucide-react";
import {
  ProductInput,
  ProductCalculations,
  CurrencyCode,
  DurationUnit,
  FrequencyUnit,
} from "@/types/product";
import { formatCurrency, formatNumber, CURRENCIES } from "@/lib/format";
import { calculateTimeBasedUses } from "@/lib/calculations";

interface ProductCardProps {
  product: ProductInput;
  calculations: ProductCalculations;
  currency: CurrencyCode;
  index: number;
  totalProducts: number;
  onUpdate: (updated: ProductInput) => void;
  onDuplicate: (product: ProductInput) => void;
  onRemove: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  calculations,
  currency,
  totalProducts,
  onUpdate,
  onDuplicate,
  onRemove,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(() => {
    return (
      (typeof product.maintenanceCost === "number" && product.maintenanceCost > 0) ||
      (typeof product.resaleValue === "number" && product.resaleValue > 0)
    );
  });

  const currencyConfig = CURRENCIES[currency] || CURRENCIES.INR;
  const isWinner = calculations.isWinner;
  const isTied = calculations.isTied;

  // Handle number input updates cleanly allowing empty string
  const handleNumericChange = (
    field: keyof ProductInput,
    rawVal: string
  ) => {
    if (rawVal === "") {
      onUpdate({ ...product, [field]: "" });
      return;
    }
    const parsed = parseFloat(rawVal);
    onUpdate({
      ...product,
      [field]: isNaN(parsed) ? "" : Math.max(0, parsed),
    });
  };

  // Live calculated uses preview for Time & Frequency mode
  const timeBasedPreview =
    product.lifespanMode === "time"
      ? calculateTimeBasedUses(
          typeof product.durationValue === "number" ? product.durationValue : 0,
          product.durationUnit || "months",
          typeof product.frequencyValue === "number" ? product.frequencyValue : 0,
          product.frequencyUnit || "week"
        )
      : null;

  return (
    <div
      className={`relative flex flex-col bg-white rounded-xl border transition-all ${
        isWinner
          ? "border-[#A7F3D0] ring-1 ring-[#A7F3D0] shadow-[0_4px_12px_-2px_rgba(5,150,105,0.08),0_2px_5px_-1px_rgba(50,50,93,0.05)]"
          : "border-[#E3E8EE] hover:border-[#CBD5E1] shadow-[0_2px_5px_-1px_rgba(50,50,93,0.05),0_1px_3px_-1px_rgba(0,0,0,0.04)]"
      }`}
    >
      {/* Top Winner Accent Ribbon / Header Bar */}
      {isWinner && (
        <div className="absolute -top-3 left-3 sm:left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#0E7452] border border-[#A7F3D0] shadow-2xs z-10">
          <Award className="w-3.5 h-3.5 text-[#059669]" />
          <span>{isTied ? "Tied Best Value" : "Best Value"}</span>
        </div>
      )}

      <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col">
        {/* Product Title & Actions */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pb-3.5 border-b border-[#E3E8EE]/70">
          <div className="flex-1 min-w-0">
            <label htmlFor={`prod-title-${product.id}`} className="sr-only">
              Product Title
            </label>
            <input
              id={`prod-title-${product.id}`}
              type="text"
              value={product.name}
              onChange={(e) => onUpdate({ ...product, name: e.target.value })}
              placeholder="e.g. Leather Shoes"
              className="w-full font-semibold text-sm sm:text-base lg:text-lg text-[#0A2540] bg-transparent border border-transparent hover:border-[#E3E8EE] focus:border-[#635BFF] focus:bg-white rounded px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/15 transition-all truncate"
            />
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onDuplicate(product)}
              disabled={totalProducts >= 4}
              title={
                totalProducts >= 4
                  ? "Maximum 4 products allowed"
                  : "Duplicate product"
              }
              aria-label="Duplicate product"
              className="p-1.5 text-[#697386] hover:text-[#0A2540] hover:bg-[#F7FAFC] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <Copy className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(product.id)}
              disabled={totalProducts <= 1}
              title={
                totalProducts <= 1
                  ? "At least 1 product required"
                  : "Remove product"
              }
              aria-label="Remove product"
              className="p-1.5 text-[#697386] hover:text-[#E25950] hover:bg-[#FEF2F2] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="mt-3.5 space-y-3.5 sm:space-y-4 flex-1">
          {/* Purchase Price */}
          <div>
            <label
              htmlFor={`price-${product.id}`}
              className="block text-xs font-medium text-[#425466] mb-1.5"
            >
              Purchase Price
            </label>
            <div className="relative rounded-lg border border-[#E3E8EE] focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-[#635BFF]/15 transition-all bg-white">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sm font-medium text-[#697386]">
                {currencyConfig.symbol}
              </span>
              <input
                id={`price-${product.id}`}
                type="number"
                min="0"
                step="any"
                value={product.price}
                onChange={(e) => handleNumericChange("price", e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 text-sm text-[#0A2540] font-medium tabular-nums bg-transparent rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Expected Lifespan Mode Switcher */}
          <div>
            <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
              <label className="text-xs font-medium text-[#425466]">
                Expected Lifespan
              </label>
              <div className="inline-flex rounded-md p-0.5 bg-[#F7FAFC] border border-[#E3E8EE]">
                <button
                  type="button"
                  onClick={() => onUpdate({ ...product, lifespanMode: "uses" })}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                    product.lifespanMode === "uses"
                      ? "bg-white text-[#635BFF] shadow-2xs font-semibold"
                      : "text-[#697386] hover:text-[#0A2540]"
                  }`}
                >
                  By Uses
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ ...product, lifespanMode: "time" })}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                    product.lifespanMode === "time"
                      ? "bg-white text-[#635BFF] shadow-2xs font-semibold"
                      : "text-[#697386] hover:text-[#0A2540]"
                  }`}
                >
                  Time & Frequency
                </button>
              </div>
            </div>

            {/* Mode 1: By Total Uses */}
            {product.lifespanMode === "uses" ? (
              <div className="space-y-2">
                <div className="relative rounded-lg border border-[#E3E8EE] focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-[#635BFF]/15 transition-all bg-white">
                  <input
                    id={`uses-${product.id}`}
                    type="number"
                    min="1"
                    value={product.totalUses}
                    onChange={(e) => handleNumericChange("totalUses", e.target.value)}
                    placeholder="e.g. 300"
                    aria-label="Total expected uses"
                    className="w-full pl-3 pr-14 py-2 text-sm text-[#0A2540] font-medium tabular-nums bg-transparent rounded-lg focus:outline-none"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-[#697386]">
                    uses
                  </span>
                </div>

                <div className="relative rounded-lg border border-[#E3E8EE] focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-[#635BFF]/15 transition-all bg-white">
                  <input
                    id={`lifespan-months-${product.id}`}
                    type="number"
                    min="1"
                    value={product.lifespanMonths ?? ""}
                    onChange={(e) =>
                      handleNumericChange("lifespanMonths", e.target.value)
                    }
                    placeholder="Lifespan in months (optional)"
                    aria-label="Expected lifespan in months (optional)"
                    className="w-full pl-3 pr-16 py-1.5 text-xs text-[#0A2540] tabular-nums bg-transparent rounded-lg focus:outline-none placeholder:text-[#94A3B8]"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[11px] text-[#697386]">
                    months
                  </span>
                </div>
              </div>
            ) : (
              /* Mode 2: By Time & Frequency */
              <div className="space-y-2">
                {/* Duration */}
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="flex-1 min-w-0 relative rounded-lg border border-[#E3E8EE] focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-[#635BFF]/15 transition-all bg-white">
                    <input
                      id={`duration-${product.id}`}
                      type="number"
                      min="1"
                      step="any"
                      value={product.durationValue}
                      onChange={(e) =>
                        handleNumericChange("durationValue", e.target.value)
                      }
                      placeholder="Duration"
                      aria-label="Lifespan duration"
                      className="w-full pl-3 pr-2 py-2 text-sm text-[#0A2540] font-medium tabular-nums bg-transparent rounded-lg focus:outline-none"
                    />
                  </div>
                  <select
                    id={`duration-unit-${product.id}`}
                    aria-label="Duration unit"
                    value={product.durationUnit || "months"}
                    onChange={(e) =>
                      onUpdate({
                        ...product,
                        durationUnit: e.target.value as DurationUnit,
                      })
                    }
                    className="w-24 sm:w-28 text-xs font-medium text-[#0A2540] bg-[#F7FAFC] border border-[#E3E8EE] rounded-lg px-2 sm:px-2.5 py-2 focus:outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/15 transition-colors cursor-pointer shrink-0"
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>

                {/* Frequency */}
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="flex-1 min-w-0 relative rounded-lg border border-[#E3E8EE] focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-[#635BFF]/15 transition-all bg-white">
                    <input
                      id={`frequency-${product.id}`}
                      type="number"
                      min="1"
                      step="any"
                      value={product.frequencyValue}
                      onChange={(e) =>
                        handleNumericChange("frequencyValue", e.target.value)
                      }
                      placeholder="Frequency"
                      aria-label="Usage frequency count"
                      className="w-full pl-3 pr-2 py-2 text-sm text-[#0A2540] font-medium tabular-nums bg-transparent rounded-lg focus:outline-none"
                    />
                  </div>
                  <select
                    id={`frequency-unit-${product.id}`}
                    aria-label="Frequency interval"
                    value={product.frequencyUnit || "week"}
                    onChange={(e) =>
                      onUpdate({
                        ...product,
                        frequencyUnit: e.target.value as FrequencyUnit,
                      })
                    }
                    className="w-24 sm:w-28 text-xs font-medium text-[#0A2540] bg-[#F7FAFC] border border-[#E3E8EE] rounded-lg px-2 sm:px-2.5 py-2 focus:outline-none focus:border-[#635BFF] focus:ring-2 focus:ring-[#635BFF]/15 transition-colors cursor-pointer shrink-0"
                  >
                    <option value="week">/ week</option>
                    <option value="month">/ month</option>
                    <option value="year">/ year</option>
                  </select>
                </div>

                {/* Computed Uses Feedback Note */}
                {timeBasedPreview && timeBasedPreview.totalUses > 0 && (
                  <div className="text-[11px] text-[#697386] pt-0.5">
                    Equals{" "}
                    <span className="font-semibold text-[#0A2540] tabular-nums">
                      {formatNumber(timeBasedPreview.totalUses)}
                    </span>{" "}
                    total uses over{" "}
                    <span className="tabular-nums">
                      {timeBasedPreview.totalMonths}
                    </span>{" "}
                    months
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Advanced Costs Accordion */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-xs font-medium text-[#697386] hover:text-[#0A2540] py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Advanced Costs</span>
                {(calculations.totalMaintenance > 0 || calculations.resaleValue > 0) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#635BFF]" />
                )}
              </span>
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 bg-[#F7FAFC] rounded-lg border border-[#E3E8EE] space-y-2.5">
                {/* Maintenance Cost */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={`maint-${product.id}`}
                      className="text-[11px] font-medium text-[#425466]"
                    >
                      Maintenance & Repairs
                    </label>
                    <div className="inline-flex rounded p-0.5 bg-white border border-[#E3E8EE] text-[10px]">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdate({ ...product, maintenanceMode: "total" })
                        }
                        className={`px-1.5 py-0.5 rounded ${
                          product.maintenanceMode === "total"
                            ? "bg-[#635BFF] text-white font-medium"
                            : "text-[#697386]"
                        }`}
                      >
                        Total
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdate({ ...product, maintenanceMode: "annual" })
                        }
                        className={`px-1.5 py-0.5 rounded ${
                          product.maintenanceMode === "annual"
                            ? "bg-[#635BFF] text-white font-medium"
                            : "text-[#697386]"
                        }`}
                      >
                        / Year
                      </button>
                    </div>
                  </div>
                  <div className="relative rounded-md border border-[#E3E8EE] focus-within:border-[#635BFF] bg-white">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-xs text-[#697386]">
                      {currencyConfig.symbol}
                    </span>
                    <input
                      id={`maint-${product.id}`}
                      type="number"
                      min="0"
                      value={product.maintenanceCost}
                      onChange={(e) =>
                        handleNumericChange("maintenanceCost", e.target.value)
                      }
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1.5 text-xs text-[#0A2540] tabular-nums bg-transparent rounded-md focus:outline-none"
                    />
                  </div>
                </div>

                {/* Resale / Salvage Value */}
                <div>
                  <label
                    htmlFor={`resale-${product.id}`}
                    className="block text-[11px] font-medium text-[#425466] mb-1"
                  >
                    Expected Resale Value
                  </label>
                  <div className="relative rounded-md border border-[#E3E8EE] focus-within:border-[#635BFF] bg-white">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-xs text-[#697386]">
                      {currencyConfig.symbol}
                    </span>
                    <input
                      id={`resale-${product.id}`}
                      type="number"
                      min="0"
                      value={product.resaleValue}
                      onChange={(e) =>
                        handleNumericChange("resaleValue", e.target.value)
                      }
                      placeholder="0"
                      className="w-full pl-6 pr-2 py-1.5 text-xs text-[#0A2540] tabular-nums bg-transparent rounded-md focus:outline-none"
                    />
                  </div>
                  {calculations.resaleExceedsCost && (
                    <p className="text-[10px] text-[#0E7452] mt-1 font-medium">
                      Resale exceeds total cost (net profit)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Primary Metric Footer */}
        <div className="mt-5 pt-3.5 border-t border-[#E3E8EE] bg-gradient-to-b from-transparent to-[#F7FAFC]/60 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 lg:-mx-6 lg:-mb-6 p-4 sm:p-5 lg:p-6 rounded-b-xl">
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#697386]">
              Cost Per Use
            </span>
            <div className="text-right">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#0A2540] tabular-nums">
                {formatCurrency(calculations.costPerUse, currency)}
              </span>
              <span className="text-xs text-[#697386] ml-1">/ use</span>
            </div>
          </div>

          {/* Secondary 3-stat Mini Row */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-2 border-t border-[#E3E8EE]/80 text-center">
            <div className="px-0.5">
              <div className="text-[9px] sm:text-[10px] uppercase font-medium text-[#697386] truncate">
                Net Cost
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#0A2540] tabular-nums mt-0.5 truncate">
                {formatCurrency(calculations.netCost, currency, {
                  showDecimals: false,
                })}
              </div>
            </div>
            <div className="px-0.5">
              <div className="text-[9px] sm:text-[10px] uppercase font-medium text-[#697386] truncate">
                Monthly
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#0A2540] tabular-nums mt-0.5 truncate">
                {formatCurrency(calculations.monthlyCost, currency, {
                  showDecimals: false,
                })}
              </div>
            </div>
            <div className="px-0.5">
              <div className="text-[9px] sm:text-[10px] uppercase font-medium text-[#697386] truncate">
                Yearly
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#0A2540] tabular-nums mt-0.5 truncate">
                {formatCurrency(calculations.yearlyCost, currency, {
                  showDecimals: false,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
