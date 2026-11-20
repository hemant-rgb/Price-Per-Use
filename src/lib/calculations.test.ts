import { describe, it, expect } from "vitest";
import {
  calculateProductMetrics,
  calculateComparisonSummary,
  calculateTimeBasedUses,
  sanitizeNumber,
} from "./calculations";
import { encodeShareState, decodeShareState } from "./shareState";
import { ProductInput } from "@/types/product";

describe("calculations.ts - PricePerUse Mathematical Engine", () => {
  it("verifies the default Shoe Benchmark calculation correctly", () => {
    const leatherShoes: ProductInput = {
      id: "p1",
      name: "Quality Leather Shoes",
      price: 3000,
      lifespanMode: "uses",
      totalUses: 300,
      lifespanMonths: 24,
      durationValue: 2,
      durationUnit: "years",
      frequencyValue: 3,
      frequencyUnit: "week",
      maintenanceCost: 0,
      maintenanceMode: "total",
      resaleValue: 0,
    };

    const budgetSneakers: ProductInput = {
      id: "p2",
      name: "Budget Sneakers",
      price: 1500,
      lifespanMode: "uses",
      totalUses: 75,
      lifespanMonths: 6,
      durationValue: 6,
      durationUnit: "months",
      frequencyValue: 3,
      frequencyUnit: "week",
      maintenanceCost: 0,
      maintenanceMode: "total",
      resaleValue: 0,
    };

    const p1Metrics = calculateProductMetrics(leatherShoes);
    const p2Metrics = calculateProductMetrics(budgetSneakers);

    expect(p1Metrics.netCost).toBe(3000);
    expect(p1Metrics.costPerUse).toBe(10);
    expect(p1Metrics.monthlyCost).toBe(125);
    expect(p1Metrics.yearlyCost).toBe(1500);

    expect(p2Metrics.netCost).toBe(1500);
    expect(p2Metrics.costPerUse).toBe(20);
    expect(p2Metrics.monthlyCost).toBe(250);
    expect(p2Metrics.yearlyCost).toBe(3000);

    const summary = calculateComparisonSummary([leatherShoes, budgetSneakers], "INR");

    expect(summary.isValid).toBe(true);
    expect(summary.winner?.id).toBe("p1");
    expect(summary.winner?.costPerUse).toBe(10);
    expect(summary.savingsPercent).toBe(50); // (20 - 10) / 20 * 100

    expect(summary.breakEven).not.toBeNull();
    expect(summary.breakEven?.breakEvenUses).toBe(150); // ceil(3000 / 20)
    expect(summary.breakEven?.upfrontCostDelta).toBe(1500);
    expect(summary.breakEven?.explanation).toContain("150 uses");
    expect(summary.breakEven?.explanation).toContain("50%");
  });

  describe("Time and frequency conversions", () => {
    it("converts weekly frequency accurately", () => {
      // 2 years (24 months) at 3 uses/week -> 3 * (24 * 4.34524) = ~313 uses
      const res = calculateTimeBasedUses(2, "years", 3, "week");
      expect(res.totalMonths).toBe(24);
      expect(res.totalUses).toBe(313);
    });

    it("converts monthly frequency accurately", () => {
      // 18 months at 4 uses/month = 72 uses
      const res = calculateTimeBasedUses(18, "months", 4, "month");
      expect(res.totalMonths).toBe(18);
      expect(res.totalUses).toBe(72);
    });

    it("converts annual frequency accurately", () => {
      // 3 years (36 months) at 12 uses/year = 36 uses
      const res = calculateTimeBasedUses(3, "years", 12, "year");
      expect(res.totalMonths).toBe(36);
      expect(res.totalUses).toBe(36);
    });
  });

  describe("Maintenance and Resale calculations", () => {
    it("handles lump sum maintenance correctly", () => {
      const product: ProductInput = {
        id: "m1",
        name: "Car",
        price: 500000,
        lifespanMode: "uses",
        totalUses: 1000,
        lifespanMonths: 60,
        durationValue: 5,
        durationUnit: "years",
        frequencyValue: 4,
        frequencyUnit: "week",
        maintenanceCost: 50000,
        maintenanceMode: "total",
        resaleValue: 200000,
      };

      const metrics = calculateProductMetrics(product);
      expect(metrics.totalMaintenance).toBe(50000);
      expect(metrics.grossCost).toBe(550000);
      expect(metrics.resaleValue).toBe(200000);
      expect(metrics.netCost).toBe(350000);
      expect(metrics.costPerUse).toBe(350);
      expect(metrics.monthlyCost).toBeCloseTo(5833.33, 1);
    });

    it("handles annual recurring maintenance correctly", () => {
      const product: ProductInput = {
        id: "m2",
        name: "Espresso Machine",
        price: 30000,
        lifespanMode: "uses",
        totalUses: 1000,
        lifespanMonths: 36, // 3 years
        durationValue: 3,
        durationUnit: "years",
        frequencyValue: 1,
        frequencyUnit: "week",
        maintenanceCost: 2000, // 2000/year * 3 years = 6000
        maintenanceMode: "annual",
        resaleValue: 6000,
      };

      const metrics = calculateProductMetrics(product);
      expect(metrics.totalMaintenance).toBe(6000);
      expect(metrics.grossCost).toBe(36000);
      expect(metrics.netCost).toBe(30000);
      expect(metrics.costPerUse).toBe(30);
    });

    it("handles resale value exceeding gross cost gracefully", () => {
      const product: ProductInput = {
        id: "r1",
        name: "Vintage Watch",
        price: 10000,
        lifespanMode: "uses",
        totalUses: 100,
        lifespanMonths: 12,
        durationValue: 1,
        durationUnit: "years",
        frequencyValue: 2,
        frequencyUnit: "week",
        maintenanceCost: 0,
        maintenanceMode: "total",
        resaleValue: 15000,
      };

      const metrics = calculateProductMetrics(product);
      expect(metrics.resaleExceedsCost).toBe(true);
      expect(metrics.netCost).toBe(-5000);
      expect(metrics.costPerUse).toBe(-50);
      expect(Number.isNaN(metrics.costPerUse)).toBe(false);
    });
  });

  describe("Edge cases and boundary protection", () => {
    it("handles 0 uses without crashing or returning NaN", () => {
      const product: ProductInput = {
        id: "e1",
        name: "Unused Gadget",
        price: 5000,
        lifespanMode: "uses",
        totalUses: 0,
        lifespanMonths: 0,
        durationValue: 0,
        durationUnit: "months",
        frequencyValue: 0,
        frequencyUnit: "month",
        maintenanceCost: 0,
        maintenanceMode: "total",
        resaleValue: 0,
      };

      const metrics = calculateProductMetrics(product);
      expect(metrics.costPerUse).toBeNull();
      expect(metrics.monthlyCost).toBeNull();
      expect(metrics.yearlyCost).toBeNull();
    });

    it("handles empty strings and negative values cleanly", () => {
      expect(sanitizeNumber("")).toBe(0);
      expect(sanitizeNumber(-50 as unknown as number)).toBe(0);
      expect(sanitizeNumber(undefined)).toBe(0);
      expect(sanitizeNumber(null)).toBe(0);
      expect(sanitizeNumber(125)).toBe(125);
    });

    it("identifies tied best values correctly", () => {
      const p1: ProductInput = {
        id: "t1",
        name: "Brand A",
        price: 100,
        lifespanMode: "uses",
        totalUses: 10,
        lifespanMonths: 1,
        durationValue: 1,
        durationUnit: "months",
        frequencyValue: 10,
        frequencyUnit: "month",
        maintenanceCost: 0,
        maintenanceMode: "total",
        resaleValue: 0,
      };

      const p2: ProductInput = {
        id: "t2",
        name: "Brand B",
        price: 200,
        lifespanMode: "uses",
        totalUses: 20,
        lifespanMonths: 2,
        durationValue: 2,
        durationUnit: "months",
        frequencyValue: 10,
        frequencyUnit: "month",
        maintenanceCost: 0,
        maintenanceMode: "total",
        resaleValue: 0,
      };

      const summary = calculateComparisonSummary([p1, p2]);
      expect(summary.tiedWinners.length).toBe(2);
      expect(summary.items[0].isTied).toBe(true);
      expect(summary.items[1].isTied).toBe(true);
    });

    it("supports 3 and 4 product comparisons", () => {
      const p1: ProductInput = {
        id: "1",
        name: "Item 1",
        price: 100,
        lifespanMode: "uses",
        totalUses: 10,
        durationValue: 1,
        durationUnit: "months",
        frequencyValue: 10,
        frequencyUnit: "month",
        maintenanceCost: 0,
        maintenanceMode: "total",
        resaleValue: 0,
      };
      const p2: ProductInput = {
        id: "2",
        name: "Item 2",
        price: 200,
        lifespanMode: "uses",
        totalUses: 10,
        durationValue: 1,
        durationUnit: "months",
        frequencyValue: 10,
        frequencyUnit: "month",
        maintenanceCost: 0,
        maintenanceMode: "total",
        resaleValue: 0,
      };
      const p3: ProductInput = {
        id: "3",
        name: "Item 3",
        price: 300,
        lifespanMode: "uses",
        totalUses: 10,
        durationValue: 1,
        durationUnit: "months",
        frequencyValue: 10,
        frequencyUnit: "month",
        maintenanceCost: 0,
        maintenanceMode: "total",
        resaleValue: 0,
      };

      const summary = calculateComparisonSummary([p1, p2, p3]);
      expect(summary.items.length).toBe(3);
      expect(summary.winner?.id).toBe("1");
      expect(summary.runnersUp.length).toBe(2);
      expect(summary.savingsPercent).toBeCloseTo(66.66, 1);
    });
  });

  describe("shareState.ts - URL Serialization and Recovery", () => {
    it("round-trips state encoding and decoding with Unicode preservation", () => {
      const payload = {
        version: 1,
        title: "Sneakers Comparison ₹ test",
        currency: "INR" as const,
        products: [
          {
            id: "shoe-1",
            name: "Goodyear Welted",
            price: 5000,
            lifespanMode: "uses" as const,
            totalUses: 500,
            durationValue: 2,
            durationUnit: "years" as const,
            frequencyValue: 5,
            frequencyUnit: "week" as const,
            maintenanceCost: 500,
            maintenanceMode: "total" as const,
            resaleValue: 1000,
          },
        ],
      };

      const encoded = encodeShareState(payload);
      expect(encoded).toBeTruthy();

      const decoded = decodeShareState(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded?.title).toBe("Sneakers Comparison ₹ test");
      expect(decoded?.currency).toBe("INR");
      expect(decoded?.products.length).toBe(1);
      expect(decoded?.products[0].name).toBe("Goodyear Welted");
      expect(decoded?.products[0].price).toBe(5000);
    });

    it("resiliently returns null on corrupted or malformed input without throwing", () => {
      expect(decodeShareState("")).toBeNull();
      expect(decodeShareState("!!!not-a-valid-base64???")).toBeNull();
      expect(decodeShareState("e30=")).toBeNull(); // empty object {} without products
    });
  });
});
