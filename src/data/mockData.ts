/**
 * HUD / Extended-dashboard data — DERIVED from financialData.ts.
 *
 * This file used to contain a parallel hand-entered copy of the FY 2025-26 numbers
 * in Crores. That parallel copy drifted badly from reality:
 *   - Total Equity was ₹216.70 Cr (real: ₹106.34 Cr) — an unexplained ₹112.95 Cr
 *     additive offset had been applied to every month of the equityTrend series.
 *   - Balance sheet did not balance (Assets 119.59 ≠ Equity 216.70 + Liab 6.99).
 *   - Net Profit was ₹1.98 Cr (real PBT: ₹2.59 Cr) because a monthly EBITDA array
 *     was mislabeled and the Mar-26 Other Income booking was ₹0.61 Cr short.
 *   - cashPositionChart.investments was in Lakhs but labelled Cr (off by 10×).
 *
 * All values in this file now derive from `financialData.ts` — the single source
 * of truth synced from Tally group-level Trial Balance (2026-04-10). Hand-entered
 * values that Tally group TB cannot expose (ledger-level breakdowns, wallet/bank
 * splits) are clearly flagged and kept only for decorative panels.
 *
 * Units: all values in ₹ Crores unless otherwise noted.
 */

import {
  MONTHS,
  monthlyRevenue as monthlyRevenueLakhs,
  monthlyCOGS as monthlyCOGSLakhs,
  monthlyTotalOpex as monthlyOpExLakhs,
  monthlyOtherIncome as monthlyOtherIncomeLakhs,
  monthlyPBT as monthlyPBTLakhs,
  monthlyCA as monthlyCALakhs,
  monthlyFixedAssets as monthlyFixedAssetsLakhs,
  monthlyInvestments as monthlyInvestmentsLakhsReal,
  monthlyEquity as monthlyEquityLakhs,
  monthlyNCL as monthlyNCLLakhs,
  monthlyCL as monthlyCLLakhs,
  monthlyTotalAssets as monthlyTotalAssetsLakhs,
  monthlyOCF as monthlyOCFLakhs,
  monthlyFreeCashFlow as monthlyFCFLakhs,
} from './financialData';

// ── Unit conversion helpers ─────────────────────────────────────────────────

const LAKHS_PER_CRORE = 100;

const toCr = (lakhs: number): number => +(lakhs / LAKHS_PER_CRORE).toFixed(2);
const toCrArray = (lakhs: number[]): number[] => lakhs.map(toCr);
const sum = (arr: number[]): number => +arr.reduce((a, b) => a + b, 0).toFixed(2);

/**
 * Sum an array of Lakhs values and convert to Crores in ONE rounding step.
 * Avoids the "sum of rounded values" drift that happens when you round each
 * month to 2dp and then add them — e.g. 12×(rounding ±0.005) can swing a total
 * by 0.06 Cr, which caused Revenue to show 46.91 Cr instead of the true 46.90.
 */
const sumLakhsAsCr = (lakhs: number[]): number =>
  +(lakhs.reduce((a, b) => a + b, 0) / LAKHS_PER_CRORE).toFixed(2);

// ── Derived monthly series (in Crores) ──────────────────────────────────────

const monthlyRevenue = toCrArray(monthlyRevenueLakhs);
const monthlyExpenses = monthlyCOGSLakhs.map((c, i) =>
  toCr(c + monthlyOpExLakhs[i]),
);
const monthlyOtherIncome = toCrArray(monthlyOtherIncomeLakhs);
// Monthly PBT (pre-tax). Equals booked PAT in the raw Tally numbers — kept
// separate so UI surfaces don't silently mislabel pre-tax figures.
const monthlyPBT = toCrArray(monthlyPBTLakhs);

// ── Derived YTD totals (in Crores) ──────────────────────────────────────────
// CRITICAL: sum in Lakhs first, convert once — see sumLakhsAsCr comment above.

const ytdRevenue = sumLakhsAsCr(monthlyRevenueLakhs);
const ytdDirectExp = sumLakhsAsCr(monthlyCOGSLakhs);
const ytdIndirectExp = sumLakhsAsCr(monthlyOpExLakhs);
const ytdTotalExp = sumLakhsAsCr(
  monthlyCOGSLakhs.map((c, i) => c + monthlyOpExLakhs[i]),
);
const ytdOtherIncome = sumLakhsAsCr(monthlyOtherIncomeLakhs);
// Booked PBT — this is the Tally-booked bottom line for FY 2025-26. The
// current-year income tax provision is only posted at year-end close by the
// tax advisor, so there is no PAT to surface until audit close.
const ytdPBT = sumLakhsAsCr(monthlyPBTLakhs);

const ytdTotalIncome = sumLakhsAsCr(
  monthlyRevenueLakhs.map((r, i) => r + monthlyOtherIncomeLakhs[i]),
);

// ── Balance Sheet closing (Mar-26, derived from financialData) ──────────────

const idxMar = 11;
const totalAssetsCr = toCr(monthlyTotalAssetsLakhs[idxMar]);

// Rolled net worth: Tally's displayed Equity misses the current-period PBT
// (it still sits in P&L A/c until year-end close). The BS identity
// A = E_rolled + NCL + CL only holds after we add PBT[M] back to Equity[M].
// See BalanceSheetPage equityRolled rationale — this is the same operation.
const totalEquityCr = toCr(monthlyEquityLakhs[idxMar] + monthlyPBTLakhs[idxMar]);
const totalLiabilitiesCr = toCr(
  monthlyNCLLakhs[idxMar] + monthlyCLLakhs[idxMar],
);

// Treasury (Investments) and Fixed Assets sourced directly from their own
// Tally sub-head series — no more `monthlyNCA − 232.56` hardcoded arithmetic.
const investmentsMarCr = toCr(monthlyInvestmentsLakhsReal[idxMar]);
const fixedAssetsMarCr = toCr(monthlyFixedAssetsLakhs[idxMar]);
const currentAssetsMarCr = toCr(monthlyCALakhs[idxMar]);

// ── OpEx breakdown (ledger-level reference, NOT reconciled to group total) ──
// Ledger splits don't sum exactly to group-level Indirect Expenses — the shortfall
// is year-end provisions (ESOP, audit, impairment) that live outside these buckets.
// Kept for display rhythm; percentages recalculated against group total.

const opexRawBreakdown = [
  { category: 'Performance Marketing', amount: 23.42, color: '#FF9F0A' },
  { category: 'Employee Benefits', amount: 10.73, color: '#BF5AF2' },
  { category: 'IT Expenses', amount: 3.40, color: '#00FFCC' },
  { category: 'Professional Charges', amount: 1.59, color: '#64D2FF' },
  { category: 'Finance Charges', amount: 1.20, color: '#FFD700' },
  { category: 'Other OpEx', amount: +(ytdIndirectExp - 40.34).toFixed(2), color: '#8A8F98' },
];
const opexCategories = opexRawBreakdown.map((row) => ({
  ...row,
  pct: Math.round((row.amount / ytdIndirectExp) * 100),
  unit: 'Cr' as const,
}));

// ── Exports ─────────────────────────────────────────────────────────────────

/**
 * Top-line KPI strip for the HUD. `pbt` is the Tally-booked pre-tax profit —
 * the honest bottom line until the year-end tax provision is posted at audit
 * close. Kept under the keys the FinancialKPIs panel already consumes so no
 * downstream churn.
 */
export const financialKPIs = {
  revenue:       { value: ytdRevenue,             unit: 'Cr', currency: '₹', color: '#00FFCC', sparkline: monthlyRevenue, label: 'REVENUE' },
  otherIncome:   { value: ytdOtherIncome,         unit: 'Cr', currency: '₹', color: '#64D2FF', sparkline: null,           label: 'OTHER INCOME' },
  totalIncome:   { value: ytdTotalIncome,         unit: 'Cr', currency: '₹', color: '#00FFCC', sparkline: null,           label: 'TOTAL INCOME' },
  totalExpenses: { value: ytdTotalExp,            unit: 'Cr', currency: '₹', color: '#FF453A', sparkline: monthlyExpenses, label: 'TOTAL EXPENSES' },
  pbt:           { value: ytdPBT,                 unit: 'Cr', currency: '₹', color: '#BF5AF2', sparkline: monthlyPBT,      label: 'PBT (BOOKED)' },
};

// ── Quarterly aggregates (derived) ──────────────────────────────────────────

const quarterSlice = (arr: number[], q: number): number[] => arr.slice(q * 3, q * 3 + 3);
const qSum = (arr: number[], q: number): number => sum(quarterSlice(arr, q));

export const additionalMetrics = {
  totalExpenses: { label: 'Total Expenses',  value: ytdTotalExp,    unit: 'Cr', currency: '₹', color: '#FF453A' },
  otherIncome:   { label: 'Other Income',    value: ytdOtherIncome, unit: 'Cr', currency: '₹', color: '#64D2FF' },
};

// ── Operating Expenses (quarterly, derived from monthly OpEx+COGS) ──────────

const quarterlyExpenses = [0, 1, 2, 3].map((q) => qSum(monthlyExpenses, q));

export const operatingExpenses = {
  quarters: [
    { label: 'Q1', value: quarterlyExpenses[0], unit: 'Cr', color: '#00FFCC' },
    { label: 'Q2', value: quarterlyExpenses[1], unit: 'Cr', color: '#FF9F0A' },
    { label: 'Q3', value: quarterlyExpenses[2], unit: 'Cr', color: '#BF5AF2' },
    { label: 'Q4', value: quarterlyExpenses[3], unit: 'Cr', color: '#64D2FF' },
  ],
  breakdown: opexCategories,
};

// ── P&L Composition donut ───────────────────────────────────────────────────
//
// The old donut stacked [Revenue, Total Expenses, Other Income, Net Profit] as
// four pie slices, which was mathematically incoherent — those values aren't
// parts of a whole (Revenue already contains Expenses and Profit).
//
// Correct reconciliation:
//   Total Income = Revenue + Other Income
//                = COGS + Total OpEx + PBT
//
// So the donut now answers "Where did every rupee of Total Income go?", with
// three segments that actually sum to the centre value. This is the same
// identity the P&L waterfall proves in financialData.ts validators.
const donutTotalIncome = ytdTotalIncome;
const donutSegments = [
  { segment: 'Direct Costs (COGS)', value: ytdDirectExp,   unit: 'Cr' as const, color: '#FF453A' },
  { segment: 'Operating Expenses',  value: ytdIndirectExp, unit: 'Cr' as const, color: '#FF9F0A' },
  { segment: 'PBT (Booked)',        value: ytdPBT,         unit: 'Cr' as const, color: '#FFD700' },
];

export const financialAnalysis = {
  total: { label: 'TOTAL INCOME', value: donutTotalIncome, unit: 'Cr' as const, currency: '₹', color: '#00FFCC' },
  donut: donutSegments,
  expenseComposition: {
    total: { value: ytdTotalExp, unit: 'Cr', currency: '₹', color: '#FF453A' },
    label: 'EXPENSE BREAKDOWN',
    categories: opexCategories,
  },
};

// ── Margin Trends (scissors chart) ──────────────────────────────────────────

export const marginTrends = {
  months: [...MONTHS],
  series: [
    { name: 'Revenue',  color: '#00FFCC', data: monthlyRevenue },
    { name: 'Expenses', color: '#FF453A', data: monthlyExpenses },
    { name: 'PBT',      color: '#FFD700', data: monthlyPBT },
  ],
};

// ── Cash Flow YTD snapshot ──────────────────────────────────────────────────

const ytdOCFCr = sumLakhsAsCr(monthlyOCFLakhs);
const ytdFCFCr = sumLakhsAsCr(monthlyFCFLakhs);

// Liquidity = Current Assets (bank/wallets) + Investments — the actually-liquid
// portion of NCA. Excludes Fixed Assets (property, equipment) which are not cash-
// convertible. Previously mis-labelled as totalAssetsCr which inflated by ₹2.33 Cr.
const totalLiquidityCr = +(currentAssetsMarCr + investmentsMarCr).toFixed(2);

/**
 * NOTE on the FCF chip: after the Cash audit we proved that NetCF is a pure
 * structural identity (ΔCash), so showing it as a standalone KPI conveys no
 * information beyond what the Liquidity number already does. Free Cash Flow
 * (OCF − CapEx) is the actual "what's left after sustaining the business"
 * number the board cares about, so it replaces the NetCF chip here.
 */
export const cashFlowData = {
  ytd: {
    ocf:       { label: 'Operating CF',    value: ytdOCFCr,        unit: 'Cr', currency: '₹', color: '#00FFCC' },
    fcf:       { label: 'Free Cash Flow',  value: ytdFCFCr,        unit: 'Cr', currency: '₹', color: '#00FFCC' },
    liquidity: { label: 'Total Liquidity', value: totalLiquidityCr, unit: 'Cr', currency: '₹', color: '#BF5AF2' },
  },
  monthlyOCF: {
    months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    data:   toCrArray(monthlyOCFLakhs),
    color:  '#00FFCC',
  },
};

// ── Header ──────────────────────────────────────────────────────────────────

export const header = {
  company: 'SPEAKX',
  reportTitle: 'YEARLY PERFORMANCE REPORT',
  fiscalYear: 'FY 2025-26',
  subtitle: 'IVYPODS TECHNOLOGY PVT LTD — Live from Tally ERP',
  statusDots: 3,
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2+: Extended dashboard data
// ══════════════════════════════════════════════════════════════════════════════

// ── P&L Waterfall ──────────────────────────────────────────────────────────

export const waterfallData = [
  { label: 'Revenue',       value: ytdRevenue,                            delta: null, color: '#00FFCC' },
  { label: 'COGS',          value: ytdDirectExp,                          delta: null, color: '#FF453A' },
  { label: 'Gross Profit',  value: +(ytdRevenue - ytdDirectExp).toFixed(2), delta: null, color: '#00FFCC' },
  { label: 'OpEx',          value: ytdIndirectExp,                        delta: null, color: '#FF453A' },
  { label: 'Other Income',  value: ytdOtherIncome,                        delta: null, color: '#64D2FF' },
  { label: 'PBT (Booked)',  value: ytdPBT,                                delta: null, color: '#FFD700' },
];

// ── Profitability Ratios (ROA uses derived total assets) ───────────────────
// ROA is computed on PBT because Tally has not booked the current-year tax
// provision yet — PBT is the honest bottom line until audit close.

const monthlyOPE = monthlyExpenses.map((e, i) =>
  monthlyRevenue[i] === 0 ? 0 : +((e / monthlyRevenue[i]) * 100).toFixed(1),
);
const monthlyROA = monthlyPBT.map((p) =>
  totalAssetsCr === 0 ? 0 : +((p / totalAssetsCr) * 100).toFixed(1),
);

export const profitabilityData = {
  ope: { label: 'OPE RATIO',    currentValue: +((ytdTotalExp / ytdRevenue) * 100).toFixed(1),  points: monthlyOPE, color: '#00FFCC' },
  roa: { label: 'ROA (pre-tax)', currentValue: +((ytdPBT / totalAssetsCr) * 100).toFixed(1),   points: monthlyROA, color: '#FF00E5' },
};

// ── Balance Sheet snapshot (Mar-26, group-level from Tally) ────────────────

// Rolled Net Worth includes current-period PBT (see totalEquityCr). With the
// rollup applied the BS identity Assets ≡ Equity + Liabilities holds at 2dp.
export const balanceSheetData = {
  equityAndLiabilities: [
    { metric: 'Net Worth (rolled)',    value: totalEquityCr, bold: true },
    { metric: 'Loans (Secured)',       value: toCr(monthlyNCLLakhs[idxMar]), bold: false },
    { metric: 'Current Liabilities',   value: toCr(monthlyCLLakhs[idxMar]), bold: false },
    { metric: 'Total Liabilities',     value: totalLiabilitiesCr, bold: true },
    { metric: 'TOTAL',                 value: +(totalEquityCr + totalLiabilitiesCr).toFixed(2), bold: true },
  ],
  assets: [
    { metric: 'Fixed Assets (net)', value: fixedAssetsMarCr, bold: false },
    { metric: 'Investments',        value: investmentsMarCr, bold: false },
    { metric: 'Current Assets',     value: currentAssetsMarCr, bold: false },
    { metric: 'Total Assets',       value: totalAssetsCr, bold: true },
  ],
};

// ── Asset Composition (for donut) ──────────────────────────────────────────

export const assetComposition = {
  centerLabel: `₹${totalAssetsCr.toFixed(1)} Cr`,
  segments: [
    { label: 'Investments',   value: investmentsMarCr,    color: '#00FFCC' },
    { label: 'Current Assets', value: currentAssetsMarCr, color: '#FFB800' },
    { label: 'Fixed Assets',  value: fixedAssetsMarCr,    color: '#FF00E5' },
  ],
};

// ── Cash & Liquidity table ─────────────────────────────────────────────────
// Ledger-level split below is from a dated reference — Tally group-level cannot
// break Investments into FD/Bond/MF categories over HTTP. Totals reconcile to
// group-level Investments via the "Total Investments" row.

const refFixedDeposits = 35.20;
const refCorporateBonds = 31.78;
const refCorporateFDs = 14.28;
const refMutualFunds = investmentsMarCr - refFixedDeposits - refCorporateBonds - refCorporateFDs;

export const cashLiquidityData = [
  { metric: 'Current Assets (Bank, Wallets, Other)', value: currentAssetsMarCr, bold: true, sub: 'HDFC, ICICI, Razorpay, PhonePe, deposits' },
  { metric: 'Fixed Deposits',            value: refFixedDeposits, bold: false, sub: 'ICICI, Kotak, RBL, HDFC, Yes Bank' },
  { metric: 'Corporate Bonds',           value: refCorporateBonds, bold: false },
  { metric: 'Corporate FDs',             value: refCorporateFDs, bold: false },
  { metric: 'Mutual Funds',              value: +refMutualFunds.toFixed(2), bold: false, sub: 'balancing line to Tally Investments' },
  { metric: 'Total Investments',         value: investmentsMarCr, bold: true },
  { metric: 'TOTAL LIQUIDITY',           value: +(currentAssetsMarCr + investmentsMarCr).toFixed(2), bold: true },
];

// ── Cash Position Chart (monthly investments + current assets, derived) ────

// Fixed Assets and Investments are now real Tally sub-head closing balances
// sourced from financialData.ts (no longer interpolated). They still sum to
// monthlyNCA exactly, so the Cash Position chart stack matches the NCA totals.
const monthlyInvestmentsLakhs = monthlyInvestmentsLakhsReal;

export const cashPositionChart = {
  months: [...MONTHS],
  bankBalance:    toCrArray(monthlyCALakhs),
  investments:    toCrArray(monthlyInvestmentsLakhs),
  totalLiquidity: monthlyCALakhs.map((ca, i) => toCr(ca + monthlyInvestmentsLakhs[i])),
};

// ── Historical Trends ──────────────────────────────────────────────────────

export const historicalTrendsData = {
  months: [...MONTHS],
  series: [
    { label: 'Revenue',      color: '#00FFCC', points: monthlyRevenue },
    { label: 'Expenses',     color: '#FF453A', points: monthlyExpenses },
    { label: 'PBT',          color: '#FFD700', points: monthlyPBT },
    { label: 'Other Income', color: '#A855F7', points: monthlyOtherIncome },
  ],
};

// ── Monthly Equity Trend (derived from financialData equity series) ────────

export const equityTrend = {
  months: [...MONTHS],
  data: toCrArray(monthlyEquityLakhs),
  color: '#A855F7',
};

// ── Debt / Equity Ratio ────────────────────────────────────────────────────

export const debtEquity = {
  totalDebt:   toCr(monthlyNCLLakhs[idxMar]),
  totalEquity: totalEquityCr,
  ratio: +(toCr(monthlyNCLLakhs[idxMar]) / totalEquityCr).toFixed(4),
};
