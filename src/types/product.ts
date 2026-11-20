export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export type LifespanMode = "uses" | "time"; // "uses" = By Total Uses, "time" = By Time & Frequency
export type FrequencyUnit = "week" | "month" | "year";
export type DurationUnit = "months" | "years";
export type MaintenanceMode = "total" | "annual";

export interface ProductInput {
  id: string;
  name: string;
  price: number | "";
  lifespanMode: LifespanMode;
  
  // Lifespan Mode: By Uses
  totalUses: number | "";
  lifespanMonths?: number | ""; // Optional duration in months for monthly/yearly cost calculations

  // Lifespan Mode: By Time & Frequency
  durationValue: number | "";
  durationUnit: DurationUnit;
  frequencyValue: number | "";
  frequencyUnit: FrequencyUnit;

  // Advanced Ownership Costs
  maintenanceCost: number | "";
  maintenanceMode: MaintenanceMode;
  resaleValue: number | "";
}

export interface ProductCalculations {
  id: string;
  name: string;
  price: number;
  totalMaintenance: number;
  grossCost: number;
  resaleValue: number;
  resaleExceedsCost: boolean;
  netCost: number;
  totalMonths: number | null;
  totalUses: number;
  costPerUse: number | null;
  monthlyCost: number | null;
  yearlyCost: number | null;
  isWinner: boolean;
  isTied: boolean;
}

export interface BreakEvenInsight {
  winnerId: string;
  winnerName: string;
  comparisonId: string;
  comparisonName: string;
  upfrontCostDelta: number;
  breakEvenUses: number;
  savingsPercent: number;
  explanation: string;
}

export interface ComparisonSummary {
  items: ProductCalculations[];
  winner: ProductCalculations | null;
  runnersUp: ProductCalculations[];
  tiedWinners: ProductCalculations[];
  savingsPercent: number | null; // Winner savings vs highest CPU product
  savingsPercentVsRunnerUp: number | null; // Winner savings vs 2nd best product
  breakEven: BreakEvenInsight | null;
  isValid: boolean;
}

export interface ComparisonPreset {
  id: string;
  name: string;
  description: string;
  currency: CurrencyCode;
  products: ProductInput[];
}

export interface SavedComparison {
  id: string;
  title: string;
  createdAt: string; // ISO date string
  currency: CurrencyCode;
  products: ProductInput[];
  winnerName: string;
  winnerCostPerUse: number | null;
}

export interface ShareablePayload {
  version: number;
  title?: string;
  currency: CurrencyCode;
  products: ProductInput[];
}
