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
  monthlyPAT as monthlyPATLakhs,
  monthlyNCA as monthlyNCALakhs,
  monthlyCA as monthlyCALakhs,
  monthlyEquity as monthlyEquityLakhs,
  monthlyNCL as monthlyNCLLakhs,
  monthlyCL as monthlyCLLakhs,
  monthlyTotalAssets as monthlyTotalAssetsLakhs,
  monthlyInvestments as monthlyInvestmentsLakhsReal,
  monthlyOCF as monthlyOCFLakhs,
  monthlyNetCF as monthlyNetCFLakhs,
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
const monthlyNetProfit = toCrArray(monthlyPATLakhs);
const monthlyNetMarginPct = monthlyRevenue.map((r, i) =>
  r === 0 ? 0 : +((monthlyNetProfit[i] / r) * 100).toFixed(1),
);

// ── Derived YTD totals (in Crores) ──────────────────────────────────────────
// CRITICAL: sum in Lakhs first, convert once — see sumLakhsAsCr comment above.

const ytdRevenue = sumLakhsAsCr(monthlyRevenueLakhs);
const ytdDirectExp = sumLakhsAsCr(monthlyCOGSLakhs);
const ytdIndirectExp = sumLakhsAsCr(monthlyOpExLakhs);
const ytdTotalExp = sumLakhsAsCr(
  monthlyCOGSLakhs.map((c, i) => c + monthlyOpExLakhs[i]),
);
const ytdOtherIncome = sumLakhsAsCr(monthlyOtherIncomeLakhs);
const ytdNetProfit = sumLakhsAsCr(monthlyPATLakhs);
const ytdTotalIncome = sumLakhsAsCr(
  monthlyRevenueLakhs.map((r, i) => r + monthlyOtherIncomeLakhs[i]),
);
const ytdNetMargin = +((ytdNetProfit / ytdRevenue) * 100).toFixed(1);

// ── Balance Sheet closing (Mar-26, derived from financialData) ──────────────

const idxMar = 11;
const totalAssetsCr = toCr(monthlyTotalAssetsLakhs[idxMar]);
const totalEquityCr = toCr(monthlyEquityLakhs[idxMar]);
const totalLiabilitiesCr = toCr(
  monthlyNCLLakhs[idxMar] + monthlyCLLakhs[idxMar],
);
const investmentsMarCr = toCr(
  monthlyNCALakhs[idxMar] - /* fixed assets, approximated from old ledger detail */ 232.56,
);
const fixedAssetsMarCr = 2.33; // Tally group-level Mar-26 Fixed Assets closing
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

export const financialKPIs = {
  revenue:      { value: ytdRevenue,     unit: 'Cr', currency: '₹', color: '#00FFCC', sparkline: monthlyRevenue },
  otherIncome:  { value: ytdOtherIncome, unit: 'Cr', currency: '₹', color: '#64D2FF', sparkline: null },
  totalIncome:  { value: ytdTotalIncome, unit: 'Cr', currency: '₹', color: '#00FFCC', sparkline: null },
  totalExpenses:{ value: ytdTotalExp,    unit: 'Cr', currency: '₹', color: '#FF453A', sparkline: monthlyExpenses },
  netProfit:    { value: ytdNetProfit,   unit: 'Cr', currency: '₹', color: '#BF5AF2', sparkline: monthlyNetProfit },
  netMargin:    { value: ytdNetMargin,   unit: '%',                  color: '#FFD700', sparkline: monthlyNetMarginPct },
};

// ── Quarterly aggregates (derived) ──────────────────────────────────────────

const quarterSlice = (arr: number[], q: number): number[] => arr.slice(q * 3, q * 3 + 3);
const qSum = (arr: number[], q: number): number => sum(quarterSlice(arr, q));

const q2Rev = qSum(monthlyRevenue, 1);
const q3Rev = qSum(monthlyRevenue, 2);
const q2Net = qSum(monthlyNetProfit, 1);
const q3Net = qSum(monthlyNetProfit, 2);
const q2Opex = qSum(monthlyExpenses, 1);
const q3Opex = qSum(monthlyExpenses, 2);

const pctChange = (curr: number, base: number): string => {
  if (base === 0) return '—';
  const sign = curr - base >= 0 ? '+' : '';
  // For QoQ on a positive base, standard % change. For a negative base, we
  // report the absolute swing labelled accordingly since "% of a negative" is
  // meaningless to most readers.
  if (base < 0) {
    return `${sign}${(curr - base).toFixed(2)} Cr`;
  }
  return `${sign}${(((curr - base) / base) * 100).toFixed(1)}%`;
};

export const qoqGrowth = {
  revenue: { label: 'REV',     change: pctChange(q3Rev, q2Rev),  color: q3Rev < q2Rev ? '#FF453A' : '#00FFCC' },
  opex:    { label: 'OPEX',    change: pctChange(q3Opex, q2Opex), color: q3Opex > q2Opex ? '#FF453A' : '#00FFCC' },
  netPnl:  { label: 'NET P&L', change: pctChange(q3Net, q2Net),   color: q3Net < q2Net ? '#FF453A' : '#00FFCC' },
};

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

// ── Financial Analysis donut ────────────────────────────────────────────────

export const financialAnalysis = {
  donut: [
    { segment: 'Revenue',        value: ytdRevenue,     unit: 'Cr', color: '#00FFCC' },
    { segment: 'Total Expenses', value: ytdTotalExp,    unit: 'Cr', color: '#FF453A' },
    { segment: 'Other Income',   value: ytdOtherIncome, unit: 'Cr', color: '#BF5AF2' },
    { segment: 'Net Profit',     value: ytdNetProfit,   unit: 'Cr', color: '#FFD700' },
  ],
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
    { name: 'Revenue',    color: '#00FFCC', data: monthlyRevenue },
    { name: 'Expenses',   color: '#FF453A', data: monthlyExpenses },
    { name: 'Net Profit', color: '#FFD700', data: monthlyNetProfit },
  ],
};

// ── Cash Flow YTD snapshot ──────────────────────────────────────────────────

const ytdOCFCr = sumLakhsAsCr(monthlyOCFLakhs);
const ytdNetCFCr = sumLakhsAsCr(monthlyNetCFLakhs);

// Liquidity = Current Assets (bank/wallets) + Investments — the actually-liquid
// portion of NCA. Excludes Fixed Assets (property, equipment) which are not cash-
// convertible. Previously mis-labelled as totalAssetsCr which inflated by ₹2.33 Cr.
const totalLiquidityCr = +(currentAssetsMarCr + investmentsMarCr).toFixed(2);

export const cashFlowData = {
  ytd: {
    ocf:       { label: 'Operating CF',    value: ytdOCFCr,        unit: 'Cr', currency: '₹', color: '#00FFCC' },
    netCF:     { label: 'Net Cash Flow',   value: ytdNetCFCr,      unit: 'Cr', currency: '₹', color: '#00FFCC' },
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
  { label: 'Net Profit',    value: ytdNetProfit,                          delta: null, color: '#FFD700' },
];

// ── Profitability Ratios (ROA uses derived total assets) ───────────────────

const monthlyOPE = monthlyExpenses.map((e, i) =>
  monthlyRevenue[i] === 0 ? 0 : +((e / monthlyRevenue[i]) * 100).toFixed(1),
);
const monthlyROA = monthlyNetProfit.map((n) =>
  totalAssetsCr === 0 ? 0 : +((n / totalAssetsCr) * 100).toFixed(1),
);

export const profitabilityData = {
  ope: { label: 'OPE RATIO', currentValue: +((ytdTotalExp / ytdRevenue) * 100).toFixed(1), points: monthlyOPE, color: '#00FFCC' },
  roa: { label: 'ROA',       currentValue: +((ytdNetProfit / totalAssetsCr) * 100).toFixed(1), points: monthlyROA, color: '#FF00E5' },
};

// ── Balance Sheet snapshot (Mar-26, group-level from Tally) ────────────────

export const balanceSheetData = {
  equityAndLiabilities: [
    { metric: 'Total Equity',          value: totalEquityCr, bold: true },
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
    { label: 'Net Profit',   color: '#FFD700', points: monthlyNetProfit },
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
