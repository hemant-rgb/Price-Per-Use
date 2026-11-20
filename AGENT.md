# PricePerUse — Engineering & Architectural Manifest (`AGENT.md`)

## 1. Product Overview & Core Value Prop
**PricePerUse** is an ultra-fast, client-side financial decision utility engineered with a Stripe-grade aesthetic. It empowers consumers and professionals to make rational purchasing decisions by evaluating the true long-term value of products through **Cost Per Use (CPU)**, **Net Ownership Cost**, **Monthly/Yearly Cost of Ownership**, and **Break-Even Crossover Analysis** across 2 to 4 competing options.

### Default Shoe Benchmark Example
- **Product A (Quality Leather Shoes):** Upfront ₹3,000 | 300 uses over 24 months | Maintenance ₹0 | Resale ₹0
  - Net Cost: ₹3,000 | **Cost Per Use: ₹10.00 / use** (Winner) | Monthly: ₹125.00
- **Product B (Budget Sneakers):** Upfront ₹1,500 | 75 uses over 6 months | Maintenance ₹0 | Resale ₹0
  - Net Cost: ₹1,500 | **Cost Per Use: ₹20.00 / use** | Monthly: ₹250.00
- **Verdict & Break-Even Insight:** Pair A costs ₹1,500 more upfront, but breaks even with Pair B after **150 uses**, delivering **50% savings per use** over its total lifespan.

---

## 2. Tech Stack & Folder Structure
- **Framework:** Next.js (App Router), React 19, TypeScript (`strict: true`).
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss";` and `@theme` tokens in `src/app/globals.css`), `clsx`, `tailwind-merge`.
- **Typography:** Inter (via `next/font/google`, zero layout shift).
- **Icons:** `lucide-react` (1.5px stroke width, monochrome/accented).
- **Export & Sharing:** `html-to-image` (high-DPI 2x PNG card generation), URL Base64/query serialization (`shareState.ts`), clean `@media print` CSS.
- **Persistence:** LocalStorage SSR-safe hook (`useLocalStorage.ts`).
- **Testing:** Vitest unit test suite covering math formulas and edge cases (`calculations.test.ts`).
- **Zero Backend Policy:** 100% client-side, zero analytics tracking, zero database, zero unnecessary state libraries.

### File Tree & Responsibilities
```text
/Users/hemantmachiwar/.gemini/antigravity/scratch/priceperuse/
├── AGENT.md                       # Single source of truth & architectural tracker
├── package.json                   # Dependencies, scripts, and engine specifications
├── tsconfig.json                  # Strict TypeScript configuration
├── vitest.config.ts               # Vitest runner configuration
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout, Inter font, SEO/metadata
│   │   ├── globals.css            # Tailwind v4 theme, tabular-nums, print CSS, hidden spinners
│   │   └── page.tsx               # Main application workspace orchestrator
│   ├── types/
│   │   └── product.ts             # Strict TypeScript interfaces for Product, Currency, Calculation
│   ├── lib/
│   │   ├── calculations.ts        # Pure math engine (Cost/use, net, monthly, break-even, delta)
│   │   ├── calculations.test.ts   # Vitest unit test suite for mathematical precision & edge cases
│   │   ├── format.ts              # Currency (INR en-IN, USD, EUR, GBP) and number formatters
│   │   ├── presets.ts             # 4 curated presets (Shoes, Laptop, Coffee, Headphones) + Blank
│   │   ├── shareState.ts          # URL query-string Base64/URLSearchParams serializer & deserializer
│   │   └── utils.ts               # cn() class utility using clsx & tailwind-merge
│   ├── hooks/
│   │   └── useLocalStorage.ts     # Hydration-safe localStorage state hook
│   └── components/
│       ├── Header.tsx             # Stripe-minimal header with Presets, Currency, Saved drawer triggers
│       ├── HeroSummaryBar.tsx     # Compact verdict banner: Winner badge, percentage savings, break-even
│       ├── ProductCard.tsx        # Responsive input card: price, dual lifespan modes, advanced costs, live footer
│       ├── ComparisonGrid.tsx     # 2-to-4 product adaptive layout container with "Add Product" action
│       ├── AnalyticsSection.tsx   # Tabbed comparison bar charts, break-even explanation, and matrix table
│       ├── ReportModal.tsx        # High-craft report preview, PNG export, share URL copy, text copy, print
│       ├── SavedDrawer.tsx        # Slide-over drawer to save, view, load, and delete comparison records
│       └── EmptyState.tsx         # Clean zero-products fallback with 1-click restore actions
```

---

## 3. Design System Contract (Stripe Aesthetic)

### Exact Stripe Tokens
- **Canvas / Background:** `#F6F9FC` (Stripe light slate)
- **Card Surface:** `#FFFFFF` (Pure white)
- **Inset / Pill / Secondary Surface:** `#F7FAFC` / `#F1F5F9`
- **Hairline Borders:** `#E3E8EE` (`1px solid`), Hover `#CBD5E1`
- **Primary Ink (Text):** `#0A2540` (Stripe Deep Navy — NEVER pure `#000000`)
- **Secondary Text:** `#425466` (Muted Slate)
- **Tertiary / Micro Labels:** `#697386` (Subtle text)
- **Brand Accent:** `#635BFF` (Stripe Blurple), Hover `#5248F5`, Soft Ring `#635BFF`/15
- **Best Value / Winner Accent:** Text `#0E7452` / `#059669`, Surface `#ECFDF5`, Hairline `#A7F3D0`
- **Micro-Shadows:**
  - Card: `0 2px 5px -1px rgba(50, 50, 93, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.04)`
  - Modal / Elevated: `0 13px 27px -5px rgba(50, 50, 93, 0.12), 0 8px 16px -8px rgba(0, 0, 0, 0.08)`

### Explicit Anti-Pattern Ban List
1. **NO AI Slop:** No purple-pink/neon-cyan gradients, no blurred background blobs, no emojis anywhere, no sparkle icons (`✨`), no heavy glassmorphism over noise, no dark-mode cyberpunk, no bouncy confetti.
2. **NO Legacy Enterprise UI:** No browser number spinners (`::-webkit-inner-spin-button` hidden), no harsh `#000000` borders, no manual "Calculate" buttons (all calculations are 100% reactive in real time), no dense 1990s grid spreadsheets, no screaming red banners while typing.

### Typography & Numerals Rules
- `Inter` with tight tracking on headings (`-0.025em`). Weights: 400, 500, 600.
- **Mandatory `tabular-nums`:** Every price, cost-per-use, numeric input, bar chart label, and breakdown table cell MUST use `tabular-nums` (`font-variant-numeric: tabular-nums`) to prevent digit jitter during typing.

---

## 4. Mathematical Engine Contract

### Formulas
1. **Total Maintenance Cost:**
   - Lump sum: `M`
   - Annual: `M * (totalMonths / 12)`
2. **Gross Cost:** `P + totalMaintenance`
3. **Net Ownership Cost:** `grossCost - R` (If `R > grossCost`, display note "Resale exceeds total cost", handle negative net cost gracefully; never NaN).
4. **Lifespan Duration (Months):**
   - In *By Uses* mode: optional or default `totalMonths = monthsInput || 12`
   - In *By Time & Frequency* mode: `durationUnit === 'years' ? duration * 12 : duration`
5. **Total Uses ($U$):**
   - *By Uses* mode: `U = directUses`
   - *By Time & Frequency* mode:
     - `per week`: `Math.round(frequency * (totalMonths * 4.34524))`
     - `per month`: `Math.round(frequency * totalMonths)`
     - `per year`: `Math.round(frequency * (totalMonths / 12))`
6. **Cost Per Use:** `U > 0 ? netOwnershipCost / U : null`
7. **Monthly Ownership Cost:** `totalMonths > 0 ? netOwnershipCost / totalMonths : null`
8. **Yearly Ownership Cost:** `monthlyCost !== null ? monthlyCost * 12 : null`
9. **Savings Delta:** `((higherCPU - winnerCPU) / higherCPU) * 100`
10. **Break-Even Threshold ($B$):**
    - Between winner (higher net cost $C_W$) and other product ($C_O$ with CPU $U_O$):
    - $B = \lceil C_W / \text{CPU}_O \rceil$ uses.
11. **Edge-Case Protections:**
    - Division by zero or missing inputs returns `null` rendered as `—`.
    - Clamped negative inputs to 0. Empty input fields allow smooth typing without forcing sticky zeros.

---

## 5. Phased Execution Tracker

- [x] **Phase 0: Context Setup & Project Scaffolding**
  - [x] Create `AGENT.md` with all 7 mandatory sections.
  - [x] Scaffold Next.js App Router with TypeScript & Tailwind CSS v4.
  - [x] Install dependencies: `lucide-react`, `clsx`, `tailwind-merge`, `html-to-image`, `vitest`.
  - [x] Configure `Inter` font, `@theme` tokens, `tabular-nums`, input spinner hiding, and `@media print` in `src/app/globals.css`.
  - [x] Verify `npm run dev` boots cleanly with zero errors.

- [x] **Phase 1: Pure Math Engine, Types, Presets & Share Serializer**
  - [x] Define types in `src/types/product.ts`.
  - [x] Implement pure math engine in `src/lib/calculations.ts`.
  - [x] Implement currency formatters in `src/lib/format.ts` (INR with en-IN, USD, EUR, GBP).
  - [x] Implement presets in `src/lib/presets.ts`.
  - [x] Implement URL state serialization in `src/lib/shareState.ts`.
  - [x] Implement `useLocalStorage` in `src/hooks/useLocalStorage.ts`.
  - [x] Write and pass 100% of unit tests in `src/lib/calculations.test.ts`.

- [x] **Phase 2: Minimalist Header, Summary Bar & Side-by-Side Product Cards**
  - [x] Build `Header.tsx` (Presets, Currency switcher, Saved drawer trigger).
  - [x] Build `HeroSummaryBar.tsx` (Winner badge, savings percentage, break-even summary).
  - [x] Build `ProductCard.tsx` (Title edit, duplicate, remove, price, dual lifespan mode, advanced collapsible costs, live footer).
  - [x] Build `ComparisonGrid.tsx` (2-4 cards, Add Product button).
  - [x] Build `EmptyState.tsx` (Restore default or preset).
  - [x] Assemble reactive state in `src/app/page.tsx`.

- [x] **Phase 3: Visual Analytics, Break-Even Insights & Breakdown Matrix**
  - [x] Build `AnalyticsSection.tsx`.
  - [x] Implement tabbed horizontal bar comparison (Cost Per Use, Net Cost, Monthly Cost).
  - [x] Implement Break-Even Crossover explanation card.
  - [x] Implement detailed comparison matrix table with clean hairlines and winner highlight.

- [x] **Phase 4: Executive Report Modal, PNG Export, URL Sharing & Saved Drawer**
  - [x] Build `ReportModal.tsx` with Stripe invoice report styling.
  - [x] Wire up real PNG export via `html-to-image` (2x DPI).
  - [x] Wire up Shareable Link copying (Base64 URL query string).
  - [x] Wire up Text Summary copy and 1-click Print / Save PDF.
  - [x] Build `SavedDrawer.tsx` (Save current, load past, delete, preview winner).
  - [x] Verify `npm run build` passes with zero TypeScript / ESLint warnings.

- [x] **Phase 5: Autonomous Browser QA, Visual Audit & Final Polish**
  - [x] Verify math in live browser on default shoe benchmark.
  - [x] Perform edge-case torture testing (Time/Frequency mode, maintenance/resale, 0 uses, currency switch).
  - [x] Test Saved drawer persistence, Shareable Link hydration, and PNG export.
  - [x] Audit Desktop (1280px) and Mobile (375px) viewports for zero layout shifts or horizontal overflows.
  - [x] Finalize `AGENT.md` verification report.

---

## 6. Decisions & Pitfalls Log
- *Decision:* Used Tailwind CSS v4 CSS-first `@theme` configuration with custom tokens matching Stripe's exact design specifications.
- *Decision:* Chose pure SVG horizontal comparison bars for zero-dependency, ultra-crisp responsive bar charts rather than heavy external charting libraries.
- *Pitfall fixed:* Separated `viewport` export from `metadata` in `layout.tsx` to satisfy Next.js 16 metadata schema with zero deprecation warnings.
- *Decision:* Configured `vitest` with Node environment and alias support to test mathematical pure functions rapidly.
- *Decision:* Used safe Base64 UTF-8 conversion in `shareState.ts` so Indian Rupee symbols (`₹`) and Unicode product names survive URL query parameters without corruption.
- *Decision:* Handled ties explicitly with `isTied: true` and a badge reading "Tied Best Value" when two options share the lowest CPU.
- *Pitfall fixed:* Resolved Next.js 16 Partial Prefetching / Cache Components prerender check by replacing unstable `new Date().getFullYear()` runtime call during SSR prerender.
- *Decision:* Exported PNG comparison cards with `pixelRatio: 2` and solid `#FFFFFF` canvas background using `html-to-image` for crisp rendering on retina mobile devices.
- *Decision:* Implemented automatic synchronization between `localStorage` draft saving and query parameter hydration, prioritizing active `?data=` parameters over local drafts.
- *Refinement:* Removed all visible "Stripe-Grade" marketing text from the header badge, title tags, and footer.
- *Responsiveness Upgrade:* Added mobile-first responsive layouts across all device sizes (320px–1280px+): compact header with auto-truncation and wrapping, touch targets >= 40px, sticky metric column on the mobile financial matrix table, responsive modal with horizontal scroll actions, and full-width mobile slide-over drawer.

---

## 7. Verification Status
- **Dev Server Status:** Stopped (as requested).
- **Build Status:** Next.js 16.4.6 production build passing cleanly (0 errors, 0 warnings).
- **Math Test Suite:** 13/13 unit tests passing in Vitest (`calculations.test.ts`).
- **Multi-Device Responsiveness:** Fully optimized for mobile (320px–480px), tablets (768px), and desktops (1024px+).
- **Hydration / Console Errors:** Clean (0 warnings, 0 errors).
