/**
 * Real FY 2025-26 financial data — sourced from Tally ERP (IVYPODS TECHNOLOGY PVT LTD).
 *
 * All amounts are in Indian Rupees.
 * Unit key:  'Cr' = Crores (10M),  'L' = Lakhs (100K)
 *
 * Data refreshed: 2026-04-07 from group-level Trial Balance.
 */

// ── Monthly P&L (Apr-25 to Mar-26) ─────────────────────────────────────────

/** Monthly revenue in Crores */
const monthlyRevenue = [4.39, 3.88, 4.27, 4.65, 4.43, 4.05, 3.66, 3.96, 4.27, 4.06, 3.39, 1.68];

/** Monthly net profit in Crores */
const monthlyNetProfit = [2.49, 1.39, 0.89, 1.09, 1.38, 0.74, 0.13, -1.78, -0.10, -0.71, -1.20, -2.25];

/** Monthly gross margin % */
const monthlyGrossMarginPct = [98.5, 98.3, 98.5, 98.8, 98.7, 98.7, 98.6, 98.8, 98.9, 98.8, 98.6, 96.5];

/** Monthly net margin % */
const monthlyNetMarginPct = [56.9, 35.9, 20.9, 23.4, 31.2, 18.3, 3.5, -44.9, -2.3, -17.4, -35.4, -134.0];

// ── YTD Totals ──────────────────────────────────────────────────────────────

const ytdRevenue     = 46.68;   // Cr
const ytdDirectExp   =  0.66;   // Cr
const ytdOtherIncome =  2.23;   // Cr
const ytdNetProfit   =  2.09;   // Cr  (after ₹46.17 Cr indirect expenses)
const ytdGrossMargin = 98.6;    // %
const ytdNetMargin   =  4.5;    // %

// ── Exports ─────────────────────────────────────────────────────────────────

export const financialKPIs = {
  revenue:      { value: ytdRevenue,     unit: 'Cr', currency: '₹', color: '#00FFCC', sparkline: monthlyRevenue },
  grossMargin:  { value: ytdGrossMargin, unit: '%',                  color: '#FFD700', sparkline: monthlyGrossMarginPct },
  ebitda:       { value: ytdNetProfit,   unit: 'Cr', currency: '₹', color: '#BF5AF2', sparkline: monthlyNetProfit },
  ebitdaMargin: { value: ytdNetMargin,   unit: '%',                  color: '#FFD700', sparkline: monthlyNetMarginPct },
  netIncome:    { value: ytdNetProfit,   unit: 'Cr', currency: '₹', color: '#00FFCC', sparkline: monthlyNetProfit },
};

/**
 * Quarter-over-Quarter growth (Q3 vs Q2).
 * Q2: Jul-Sep rev = 13.13 Cr,  Q3: Oct-Dec rev = 11.88 Cr
 */
const q2Rev = 4.65 + 4.43 + 4.05;  // 13.13
const q3Rev = 3.66 + 3.96 + 4.27;  // 11.88
const q2Net = 1.09 + 1.38 + 0.74;  // 3.21
const q3Net = 0.13 + -1.78 + -0.10; // -1.75

export const qoqGrowth = {
  revenue: { label: 'REV',     change: `${((q3Rev - q2Rev) / q2Rev * 100).toFixed(1)}%`, color: '#FF453A' },
  gross:   { label: 'GROSS',   change: '98.8%',                                          color: '#FFD700' },
  ebitda:  { label: 'NET P&L', change: `${((q3Net - q2Net) / Math.abs(q2Net) * 100).toFixed(0)}%`, color: '#FF453A' },
};

export const additionalMetrics = {
  operatingCashFlow: { label: 'Total Investments',  value: 109.79, unit: 'Cr', currency: '₹', color: '#00FFCC' },
  freeCashFlow:      { label: 'Equity (Capital)',    value: 103.75, unit: 'Cr', currency: '₹', color: '#00FFCC' },
  evEbitda:          { label: 'Debt-Equity Ratio',   value: 0.03,   unit: '',                   color: '#FFFFFF' },
};

/**
 * Quarterly operating expenses (Direct + Indirect).
 */
export const operatingExpenses = {
  quarters: [
    { label: 'Q1', value: 7.89,  unit: 'Cr', color: '#00FFCC' },
    { label: 'Q2', value: 10.01, unit: 'Cr', color: '#FF9F0A' },
    { label: 'Q3', value: 14.09, unit: 'Cr', color: '#BF5AF2' },
    { label: 'Q4', value: 14.84, unit: 'Cr', color: '#64D2FF' },
  ],
  breakdown: [
    { category: 'Indirect Expenses',  pct: 99,  color: '#BF5AF2' },
    { category: 'Direct Expenses',    pct: 1,   color: '#FF453A' },
    { category: 'Server & Infra',     pct: 42,  color: '#00FFCC' },
    { category: 'Salaries',           pct: 35,  color: '#FFD700' },
    { category: 'Marketing & Sales',  pct: 15,  color: '#8A8F98' },
  ],
};

/**
 * Revenue analysis — SpeakX is a pure subscription business.
 * All revenue comes from Sales Accounts (Subscription Revenue).
 * The donut shows YTD P&L composition.
 */
export const financialAnalysis = {
  donut: [
    { segment: 'Subscription Revenue', value: ytdRevenue,     unit: 'Cr', color: '#00FFCC' },
    { segment: 'Other Income',         value: ytdOtherIncome, unit: 'Cr', color: '#BF5AF2' },
    { segment: 'Direct Expenses',      value: ytdDirectExp,   unit: 'Cr', color: '#FFD700' },
  ],
  revenueComposition: {
    total: { value: ytdRevenue, unit: 'Cr', currency: '₹', color: '#00FFCC' },
    label: 'SUBSCRIPTION REVENUE',
    split: [
      { type: 'Revenue', pct: 95, color: '#00FFCC' },
      { type: 'Other',   pct: 5,  color: '#BF5AF2' },
    ],
    sparkline: monthlyRevenue,
  },
};

/**
 * Margin trends — 12-month monthly view.
 * Gross Margin is near-100% (SaaS), so the interesting story is Net Margin.
 * Adding OpEx absorption line = (Rev - IndirectExp) / Rev.
 */
const indirectByMonth = [1.83, 2.53, 3.33, 3.52, 3.04, 3.29, 3.50, 5.70, 4.74, 4.83, 4.60, 5.26];
const monthlyOpExMarginPct = monthlyRevenue.map((rev, i) =>
  rev > 0 ? Math.round((rev - indirectByMonth[i]) / rev * 100 * 10) / 10 : 0
);

export const marginTrends = {
  months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  series: [
    { name: 'Gross Margin',    color: '#00FFCC', data: monthlyGrossMarginPct },
    { name: 'OpEx Absorption', color: '#BF5AF2', data: monthlyOpExMarginPct },
    { name: 'Net Margin',      color: '#FFD700', data: monthlyNetMarginPct },
  ],
};

export const cashFlow = {
  netCashFromOps: { label: 'YTD Net Profit',  value: ytdNetProfit,   unit: 'Cr', currency: '₹', color: '#00FFCC' },
  freeCashFlow:   { label: 'YTD Other Income', value: ytdOtherIncome, unit: 'Cr', currency: '₹', color: '#00FFCC' },
};

/**
 * Forecast — simple run-rate projection.
 * H1 (Apr-Sep) revenue = 25.67 Cr → annualized ~51.3 Cr
 * Recent trend (H2 so far) is declining, so conservative range.
 */
export const forecast = {
  projectedRevenue:   { label: 'Run-Rate Revenue (FY27)',  value: 48.0, unit: 'Cr', currency: '₹', color: '#00FFCC' },
  revenueRange:       { low: 42.0, high: 52.0,            unit: 'Cr', currency: '₹' },
  projectedNetIncome: { label: 'Target Net Profit (FY27)', value: 5.0,  unit: 'Cr', currency: '₹', color: '#00FFCC' },
};

export const header = {
  company: 'SPEAKX',
  reportTitle: 'YEARLY PERFORMANCE REPORT',
  fiscalYear: 'FY 2025-26',
  subtitle: 'IVYPODS TECHNOLOGY PVT LTD — Live from Tally ERP',
  date: '07 APR 2026',
  statusDots: 3,
};
