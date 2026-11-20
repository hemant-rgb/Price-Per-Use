import { CurrencyCode, CurrencyConfig } from "@/types/product";

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    locale: "en-IN",
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "de-DE",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    locale: "en-GB",
  },
};

export interface FormatCurrencyOptions {
  decimals?: number;
  showDecimals?: boolean;
  fallback?: string;
}

/**
 * Format a numeric amount into a localized currency string.
 * Uses Indian numbering grouping (e.g. ₹1,50,000.00) for INR.
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: CurrencyCode = "INR",
  options: FormatCurrencyOptions = {}
): string {
  const { decimals = 2, showDecimals = true, fallback = "—" } = options;

  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    return fallback;
  }

  const config = CURRENCIES[currency] || CURRENCIES.INR;

  try {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: showDecimals ? decimals : 0,
      maximumFractionDigits: showDecimals ? decimals : 0,
    });
    return formatter.format(amount);
  } catch {
    // Graceful fallback if Intl fails
    const fixed = amount.toFixed(showDecimals ? decimals : 0);
    return `${config.symbol}${fixed}`;
  }
}

/**
 * Format a raw number with locale-specific thousand separators.
 */
export function formatNumber(
  value: number | null | undefined,
  locale: string = "en-IN",
  decimals: number = 0
): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage with clean precision.
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(decimals)}%`;
}
