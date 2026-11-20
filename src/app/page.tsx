"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { HeroSummaryBar } from "@/components/HeroSummaryBar";
import { ComparisonGrid } from "@/components/ComparisonGrid";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { EmptyState } from "@/components/EmptyState";
import { ReportModal } from "@/components/ReportModal";
import { SavedDrawer } from "@/components/SavedDrawer";
import {
  ProductInput,
  CurrencyCode,
  SavedComparison,
} from "@/types/product";
import { DEFAULT_SHOE_BENCHMARK, PRESETS, createBlankProduct } from "@/lib/presets";
import { calculateComparisonSummary } from "@/lib/calculations";
import { decodeShareState } from "@/lib/shareState";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function Home() {
  const [currency, setCurrency] = useLocalStorage<CurrencyCode>(
    "priceperuse_currency",
    "INR"
  );
  const [savedComparisons, setSavedComparisons] = useLocalStorage<SavedComparison[]>(
    "priceperuse_saved",
    []
  );

  const [products, setProducts] = useState<ProductInput[]>(DEFAULT_SHOE_BENCHMARK);
  const [hasInitializedUrl, setHasInitializedUrl] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);

  // Initialize from URL query param ?data=... or localStorage draft
  useEffect(() => {
    if (typeof window === "undefined" || hasInitializedUrl) return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get("data");

      if (dataParam) {
        const decoded = decodeShareState(dataParam);
        if (decoded && decoded.products && decoded.products.length > 0) {
          setProducts(decoded.products);
          if (decoded.currency) {
            setCurrency(decoded.currency);
          }
          setHasInitializedUrl(true);
          return;
        }
      }

      // If no URL param, check localStorage for active draft
      const cachedDraft = window.localStorage.getItem("priceperuse_draft_products");
      if (cachedDraft) {
        const parsed = JSON.parse(cachedDraft);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setHasInitializedUrl(true);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to initialize state from URL or cache:", e);
    }

    setHasInitializedUrl(true);
  }, [hasInitializedUrl, setCurrency]);

  // Persist draft products to localStorage
  useEffect(() => {
    if (!hasInitializedUrl || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "priceperuse_draft_products",
        JSON.stringify(products)
      );
    } catch (e) {
      console.warn("Failed to save draft to localStorage:", e);
    }
  }, [products, hasInitializedUrl]);

  // Compute live calculations
  const summary = useMemo(() => {
    return calculateComparisonSummary(products, currency);
  }, [products, currency]);

  // Handlers
  const handleUpdateProduct = useCallback(
    (index: number, updated: ProductInput) => {
      setProducts((prev) => {
        const next = [...prev];
        next[index] = updated;
        return next;
      });
    },
    []
  );

  const handleDuplicateProduct = useCallback((productToDuplicate: ProductInput) => {
    setProducts((prev) => {
      if (prev.length >= 4) return prev;
      const copy: ProductInput = {
        ...productToDuplicate,
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: `${productToDuplicate.name} (Copy)`,
      };
      return [...prev, copy];
    });
  }, []);

  const handleRemoveProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleAddProduct = useCallback(() => {
    setProducts((prev) => {
      if (prev.length >= 4) return prev;
      return [...prev, createBlankProduct(prev.length + 1)];
    });
  }, []);

  const handleResetToDefault = useCallback(() => {
    setProducts(DEFAULT_SHOE_BENCHMARK);
    setCurrency("INR");
  }, [setCurrency]);

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      const preset = PRESETS.find((p) => p.id === presetId);
      if (preset) {
        setProducts(preset.products);
        setCurrency(preset.currency);
      }
    },
    [setCurrency]
  );

  // Saved Drawer Handlers
  const handleSaveCurrent = useCallback(
    (title: string) => {
      const newSaved: SavedComparison = {
        id: `saved-${Date.now()}`,
        title,
        createdAt: new Date().toISOString(),
        currency,
        products,
        winnerName: summary.winner?.name || "Best Option",
        winnerCostPerUse: summary.winner?.costPerUse || null,
      };

      setSavedComparisons((prev) => [newSaved, ...prev]);
    },
    [currency, products, summary.winner, setSavedComparisons]
  );

  const handleLoadComparison = useCallback(
    (saved: SavedComparison) => {
      setProducts(saved.products);
      setCurrency(saved.currency);
    },
    [setCurrency]
  );

  const handleDeleteComparison = useCallback(
    (id: string) => {
      setSavedComparisons((prev) => prev.filter((item) => item.id !== id));
    },
    [setSavedComparisons]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F9FC]">
      {/* Header */}
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        onSelectPreset={handleSelectPreset}
        onReset={handleResetToDefault}
        onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        savedCount={savedComparisons.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1160px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Live Verdict Banner */}
        <HeroSummaryBar summary={summary} currency={currency} />

        {/* Product Comparison Grid or Empty State */}
        {products.length === 0 ? (
          <EmptyState
            onLoadDefault={handleResetToDefault}
            onAddProduct={handleAddProduct}
          />
        ) : (
          <>
            <ComparisonGrid
              products={products}
              calculations={summary.items}
              currency={currency}
              onUpdateProduct={handleUpdateProduct}
              onDuplicateProduct={handleDuplicateProduct}
              onRemoveProduct={handleRemoveProduct}
              onAddProduct={handleAddProduct}
              onResetToDefault={handleResetToDefault}
            />

            {/* Visual Comparison Analytics & Breakdown Matrix */}
            <AnalyticsSection summary={summary} currency={currency} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E3E8EE] bg-white py-5 sm:py-6 mt-10 sm:mt-12 text-center text-xs text-[#697386]">
        <div className="max-w-[1160px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <p>© 2026 PricePerUse — Value & Cost-Per-Use Calculator</p>
          <p className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
            <span>100% Client-Side</span>
            <span>•</span>
            <span>Zero Tracking</span>
            <span>•</span>
            <span>No Server Storage</span>
          </p>
        </div>
      </footer>

      {/* Executive Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        products={products}
        summary={summary}
        currency={currency}
      />

      {/* Slide-over Saved Comparisons Drawer */}
      <SavedDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedComparisons={savedComparisons}
        onSaveCurrent={handleSaveCurrent}
        onLoadComparison={handleLoadComparison}
        onDeleteComparison={handleDeleteComparison}
        currentProducts={products}
        currentSummary={summary}
        currency={currency}
      />
    </div>
  );
}
