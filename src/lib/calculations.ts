import {
  ProductInput,
  ProductCalculations,
  ComparisonSummary,
  BreakEvenInsight,
  CurrencyCode,
} from "@/types/product";
import { formatCurrency, formatPercent } from "./format";

/**
 * Cleanly parse a numeric input field, treating empty strings or invalid inputs safely.
 */
export function sanitizeNumber(value: number | "" | undefined | null): number {
  if (value === "" || value === undefined || value === null) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : Math.max(0, num);
}

/**
 * Calculate total uses from lifespan duration and frequency.
 */
export function calculateTimeBasedUses(
  durationValue: number,
  durationUnit: "months" | "years",
  frequencyValue: number,
  frequencyUnit: "week" | "month" | "year"
): { totalMonths: number; totalUses: number } {
  const totalMonths = durationUnit === "years" ? durationValue * 12 : durationValue;

  if (totalMonths <= 0 || frequencyValue <= 0) {
    return { totalMonths, totalUses: 0 };
  }

  let totalUses = 0;
  if (frequencyUnit === "week") {
    // 4.34524 average weeks per month (52.1429 / 12)
    totalUses = Math.round(frequencyValue * (totalMonths * 4.34524));
  } else if (frequencyUnit === "month") {
    totalUses = Math.round(frequencyValue * totalMonths);
  } else if (frequencyUnit === "year") {
    totalUses = Math.round(frequencyValue * (totalMonths / 12));
  }

  return {
    totalMonths,
    totalUses: Math.max(0, totalUses),
  };
}

/**
 * Calculate metrics for an individual product.
 */
export function calculateProductMetrics(input: ProductInput): ProductCalculations {
  const price = sanitizeNumber(input.price);
  const resaleValue = sanitizeNumber(input.resaleValue);
  const rawMaintenance = sanitizeNumber(input.maintenanceCost);

  let totalMonths: number | null = null;
  let totalUses = 0;

  if (input.lifespanMode === "time") {
    const duration = sanitizeNumber(input.durationValue);
    const frequency = sanitizeNumber(input.frequencyValue);
    const result = calculateTimeBasedUses(
      duration,
      input.durationUnit || "months",
      frequency,
      input.frequencyUnit || "month"
    );
    totalMonths = result.totalMonths > 0 ? result.totalMonths : null;
    totalUses = result.totalUses;
  } else {
    // "uses" mode
    totalUses = Math.round(sanitizeNumber(input.totalUses));
    const monthsInput = sanitizeNumber(input.lifespanMonths);
    totalMonths = monthsInput > 0 ? monthsInput : null;
  }

  // Maintenance cost calculation
  let totalMaintenance = rawMaintenance;
  if (input.maintenanceMode === "annual") {
    if (totalMonths !== null && totalMonths > 0) {
      totalMaintenance = rawMaintenance * (totalMonths / 12);
    } else {
      // If duration is not provided, assume 1 year
      totalMaintenance = rawMaintenance;
    }
  }

  const grossCost = price + totalMaintenance;
  const resaleExceedsCost = resaleValue > grossCost;
  const netCost = grossCost - resaleValue;

  // Cost Per Use
  const costPerUse = totalUses > 0 ? netCost / totalUses : null;

  // Monthly & Yearly Cost
  const monthlyCost =
    totalMonths !== null && totalMonths > 0 ? netCost / totalMonths : null;
  const yearlyCost = monthlyCost !== null ? monthlyCost * 12 : null;

  return {
    id: input.id,
    name: input.name.trim() || "Untitled Product",
    price,
    totalMaintenance,
    grossCost,
    resaleValue,
    resaleExceedsCost,
    netCost,
    totalMonths,
    totalUses,
    costPerUse,
    monthlyCost,
    yearlyCost,
    isWinner: false,
    isTied: false,
  };
}

/**
 * Generate a comprehensive comparison summary across 2 to 4 products.
 */
export function calculateComparisonSummary(
  inputs: ProductInput[],
  currency: CurrencyCode = "INR"
): ComparisonSummary {
  if (!inputs || inputs.length === 0) {
    return {
      items: [],
      winner: null,
      runnersUp: [],
      tiedWinners: [],
      savingsPercent: null,
      savingsPercentVsRunnerUp: null,
      breakEven: null,
      isValid: false,
    };
  }

  const calculatedItems = inputs.map(calculateProductMetrics);

  // Filter items that have a valid cost per use
  const validItems = calculatedItems.filter(
    (item) => item.costPerUse !== null && isFinite(item.costPerUse)
  );

  if (validItems.length === 0) {
    return {
      items: calculatedItems,
      winner: null,
      runnersUp: [],
      tiedWinners: [],
      savingsPercent: null,
      savingsPercentVsRunnerUp: null,
      breakEven: null,
      isValid: false,
    };
  }

  // Sort valid items by lowest costPerUse
  const sortedByCpu = [...validItems].sort(
    (a, b) => (a.costPerUse as number) - (b.costPerUse as number)
  );

  const bestCpu = sortedByCpu[0].costPerUse as number;
  const epsilon = 0.0001; // Precision for ties

  const tiedWinners = sortedByCpu.filter(
    (item) => Math.abs((item.costPerUse as number) - bestCpu) < epsilon
  );
  const isTied = tiedWinners.length > 1;

  // Mark items as winner / tied
  calculatedItems.forEach((item) => {
    if (
      item.costPerUse !== null &&
      Math.abs(item.costPerUse - bestCpu) < epsilon
    ) {
      item.isWinner = true;
      item.isTied = isTied;
    }
  });

  const winner = calculatedItems.find((i) => i.id === sortedByCpu[0].id) || null;
  const runnersUp = sortedByCpu.slice(1);

  // Savings percentage vs highest cost per use item
  let savingsPercent: number | null = null;
  let savingsPercentVsRunnerUp: number | null = null;

  if (winner && winner.costPerUse !== null && runnersUp.length > 0) {
    const highestCpuItem = sortedByCpu[sortedByCpu.length - 1];
    const highestCpu = highestCpuItem.costPerUse as number;

    if (highestCpu > 0) {
      savingsPercent = Math.max(
        0,
        ((highestCpu - winner.costPerUse) / highestCpu) * 100
      );
    }

    const runnerUpCpu = runnersUp[0].costPerUse as number;
    if (runnerUpCpu > 0) {
      savingsPercentVsRunnerUp = Math.max(
        0,
        ((runnerUpCpu - winner.costPerUse) / runnerUpCpu) * 100
      );
    }
  }

  // Break-even insight engine
  let breakEven: BreakEvenInsight | null = null;

  if (winner && winner.costPerUse !== null && runnersUp.length > 0) {
    // Compare winner against the best competitor that is NOT tied with winner
    const nonTiedCompetitors = runnersUp.filter(
      (item) => Math.abs((item.costPerUse as number) - (winner.costPerUse as number)) >= epsilon
    );

    if (nonTiedCompetitors.length > 0) {
      const other = nonTiedCompetitors[0];
      const otherCpu = other.costPerUse as number;

      if (otherCpu > 0) {
        const upfrontDelta = winner.netCost - other.netCost;

        if (upfrontDelta > 0) {
          // Winner costs more upfront
          const breakEvenUses = Math.ceil(winner.netCost / otherCpu);
          const savings = Math.max(
            0,
            ((otherCpu - winner.costPerUse) / otherCpu) * 100
          );

          const formattedDelta = formatCurrency(upfrontDelta, currency, {
            showDecimals: false,
          });
          const formattedSavings = formatPercent(savings, 0);

          breakEven = {
            winnerId: winner.id,
            winnerName: winner.name,
            comparisonId: other.id,
            comparisonName: other.name,
            upfrontCostDelta: upfrontDelta,
            breakEvenUses,
            savingsPercent: savings,
            explanation: `${winner.name} costs ${formattedDelta} more upfront, but becomes better value than ${other.name} after ${breakEvenUses} uses — saving you ${formattedSavings} per use over its full lifespan.`,
          };
        } else if (upfrontDelta <= 0) {
          // Winner is cheaper upfront AND cheaper per use: immediate win
          const savings = Math.max(
            0,
            ((otherCpu - winner.costPerUse) / otherCpu) * 100
          );
          const formattedSavings = formatPercent(savings, 0);

          breakEven = {
            winnerId: winner.id,
            winnerName: winner.name,
            comparisonId: other.id,
            comparisonName: other.name,
            upfrontCostDelta: upfrontDelta,
            breakEvenUses: 1,
            savingsPercent: savings,
            explanation: `${winner.name} costs less upfront and saves you ${formattedSavings} per use compared to ${other.name} — winning immediately on day 1.`,
          };
        }
      }
    }
  }

  return {
    items: calculatedItems,
    winner,
    runnersUp,
    tiedWinners,
    savingsPercent,
    savingsPercentVsRunnerUp,
    breakEven,
    isValid: validItems.length >= 2,
  };
}
