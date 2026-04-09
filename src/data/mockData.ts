/**
 * Real FY 2025-26 financial data — sourced from Tally ERP (IVYPODS TECHNOLOGY PVT LTD).
 *
 * All amounts are in Indian Rupees.
 * Unit key:  'Cr' = Crores (10M),  'L' = Lakhs (100K)
 *
 * Data refreshed: 2026-04-09 from group-level Trial Balance (live Tally sync).
 * Cash flow computed via direct method from actual cash balance changes.
 */

// ── Monthly P&L (Apr-25 to Mar-26) ─────────────────────────────────────────

/** Monthly revenue in Crores */
const monthlyRevenue = [4.39, 3.88, 4.27, 4.65, 4.43, 4.05, 3.66, 3.96, 4.27, 4.06, 3.39, 1.90];

/** Monthly total expenses (Direct + Indirect) in Crores */
const monthlyExpenses = [1.90, 2.60, 3.40, 3.57, 3.09, 3.34, 3.55, 5.75, 4.79, 4.87, 4.65, 5.70];

/** Monthly net profit (EBITDA proxy) in Crores */
const monthlyNetProfit = [2.49, 1.39, 0.89, 1.09, 1.38, 0.74, 0.13, -1.78, -0.10, -0.71, -1.20, -2.36];

/** Monthly net margin % */
const monthlyNetMarginPct = [56.7, 35.8, 20.8, 23.4, 31.2, 18.3, 3.5, -44.9, -2.3, -17.5, -35.4, -124.2];

// ── YTD Totals ──────────────────────────────────────────────────────────────

const ytdRevenue     = 46.90;   // Cr
const ytdDirectExp   =  0.66;   // Cr
const ytdIndirectExp = 46.55;   // Cr
const ytdTotalExp    = 47.21;   // Cr  (direct + indirect)
const ytdOtherIncome =  2.29;   // Cr
const ytdNetProfit   =  1.98;   // Cr
const ytdNetMargin   =  4.2;    // %

// ── OpEx Breakdown (real Tally sub-accounts, exploded TB) ───────────────────

const opexCategories = [
  { category: 'Performance Marketing', pct: 57, color: '#FF9F0A', amount: 23.42 },
  { category: 'Employee Benefits',     pct: 26, color: '#BF5AF2', amount: 10.73 },
  { category: 'IT Expenses',           pct: 8,  color: '#00FFCC', amount: 3.40 },
  { category: 'Professional Charges',  pct: 4,  color: '#64D2FF', amount: 1.59 },
  { category: 'Finance Charges',       pct: 3,  color: '#FFD700', amount: 1.20 },
  { category: 'Other OpEx',            pct: 2,  color: '#8A8F98', amount: 1.13 },
];

// ── Exports ─────────────────────────────────────────────────────────────────

const ytdTotalIncome = ytdRevenue + ytdOtherIncome; // 48.91 Cr

export const financialKPIs = {
  revenue:      { value: ytdRevenue,      unit: 'Cr', currency: '₹', color: '#00FFCC', sparkline: monthlyRevenue },
  otherIncome:  { value: ytdOtherIncome,  unit: 'Cr', currency: '₹', color: '#64D2FF', sparkline: null },
  totalIncome:  { value: ytdTotalIncome,  unit: 'Cr', currency: '₹', color: '#00FFCC', sparkline: null },
  totalExpenses:{ value: ytdTotalExp,     unit: 'Cr', currency: '₹', color: '#FF453A', sparkline: monthlyExpenses },
  netProfit:    { value: ytdNetProfit,    unit: 'Cr', currency: '₹', color: '#BF5AF2', sparkline: monthlyNetProfit },
  netMargin:    { value: ytdNetMargin,    unit: '%',                  color: '#FFD700', sparkline: monthlyNetMarginPct },
};

/**
 * Quarter-over-Quarter growth (Q3 vs Q2).
 * Q2: Jul-Sep rev = 13.13 Cr,  Q3: Oct-Dec rev = 11.88 Cr
 */
const q2Rev = 4.65 + 4.43 + 4.05;  // 13.13
const q3Rev = 3.66 + 3.96 + 4.27;  // 11.88
const q2Net = 1.09 + 1.38 + 0.74;  // 3.21
const q3Net = 0.13 + -1.78 + -0.10; // -1.75
const q2Opex = 3.58 + 3.10 + 3.34; // 10.01
const q3Opex = 3.55 + 5.75 + 4.79; // 14.09

export const qoqGrowth = {
  revenue: { label: 'REV',    change: `${((q3Rev - q2Rev) / q2Rev * 100).toFixed(1)}%`, color: '#FF453A' },
  opex:    { label: 'OPEX',   change: `+${((q3Opex - q2Opex) / q2Opex * 100).toFixed(1)}%`, color: '#FF453A' },
  netPnl:  { label: 'NET P&L', change: `${((q3Net - q2Net) / Math.abs(q2Net) * 100).toFixed(0)}%`, color: '#FF453A' },
};

export const additionalMetrics = {
  totalExpenses: { label: 'Total Expenses',  value: ytdTotalExp,    unit: 'Cr', currency: '₹', color: '#FF453A' },
  otherIncome:   { label: 'Other Income',    value: ytdOtherIncome, unit: 'Cr', currency: '₹', color: '#64D2FF' },
};

/**
 * Quarterly operating expenses (Direct + Indirect).
 */
export const operatingExpenses = {
  quarters: [
    { label: 'Q1', value: 7.89,  unit: 'Cr', color: '#00FFCC' },
    { label: 'Q2', value: 10.01, unit: 'Cr', color: '#FF9F0A' },
    { label: 'Q3', value: 14.09, unit: 'Cr', color: '#BF5AF2' },
    { label: 'Q4', value: 15.22, unit: 'Cr', color: '#64D2FF' },
  ],
  breakdown: opexCategories,
};

/**
 * P&L waterfall for donut chart — shows how revenue flows to net profit.
 */
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

/**
 * Revenue vs Expenses vs Net Profit — absolute ₹ Cr, 12-month scissors chart.
 */
export const marginTrends = {
  months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  series: [
    { name: 'Revenue',      color: '#00FFCC', data: monthlyRevenue },
    { name: 'Expenses',     color: '#FF453A', data: monthlyExpenses },
    { name: 'Net Profit',   color: '#FFD700', data: monthlyNetProfit },
  ],
};

/**
 * Cash Flow — direct method, perfectly reconciled.
 * OCF derived as balancing figure: ΔCash - ICF - FCF.
 * Monthly arrays are May25–Mar26 (11 months, Apr25 is the base).
 */
export const cashFlowData = {
  ytd: {
    ocf:       { label: 'Operating CF',    value: 10.42, unit: 'Cr', currency: '₹', color: '#00FFCC' },
    netCF:     { label: 'Net Cash Flow',   value: 0.72,  unit: 'Cr', currency: '₹', color: '#00FFCC' },
    liquidity: { label: 'Total Liquidity', value: 113.96, unit: 'Cr', currency: '₹', color: '#BF5AF2' },
  },
  monthlyOCF: {
    months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    data:   [2.84, 2.90, 0.88, 1.65, 0.67, 0.58, 3.91, -1.56, 0.61, -1.17, -0.94],
    color:  '#00FFCC',
  },
};

export const header = {
  company: 'SPEAKX',
  reportTitle: 'YEARLY PERFORMANCE REPORT',
  fiscalYear: 'FY 2025-26',
  subtitle: 'IVYPODS TECHNOLOGY PVT LTD — Live from Tally ERP',
  statusDots: 3,
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2+: Extended dashboard data (from Tally Trial Balance)
// ══════════════════════════════════════════════════════════════════════════════

// ── P&L Waterfall ──────────────────────────────────────────────────────────

export const waterfallData = [
  { label: 'Revenue',       value: ytdRevenue,     delta: null,   color: '#00FFCC' },
  { label: 'COGS',          value: ytdDirectExp,   delta: null,   color: '#FF453A' },
  { label: 'Gross Profit',  value: +(ytdRevenue - ytdDirectExp).toFixed(2), delta: null, color: '#00FFCC' },
  { label: 'OpEx',          value: ytdIndirectExp, delta: null,   color: '#FF453A' },
  { label: 'Other Income',  value: ytdOtherIncome, delta: null,   color: '#64D2FF' },
  { label: 'Net Profit',    value: ytdNetProfit,   delta: null,   color: '#FFD700' },
];

// ── Profitability Ratios ───────────────────────────────────────────────────

const monthlyOPE = monthlyExpenses.map((e, i) => +(e / monthlyRevenue[i] * 100).toFixed(1));
const monthlyROA = monthlyNetProfit.map((n) => +(n / 119.5 * 100).toFixed(1)); // total assets ~₹119.5 Cr

export const profitabilityData = {
  ope: { label: 'OPE RATIO', currentValue: +(ytdTotalExp / ytdRevenue * 100).toFixed(1), points: monthlyOPE, color: '#00FFCC' },
  roa: { label: 'ROA',       currentValue: +(ytdNetProfit / 119.5 * 100).toFixed(1),     points: monthlyROA, color: '#FF00E5' },
};

// ── Balance Sheet (Mar-26 snapshot from Tally TB) ──────────────────────────

export const balanceSheetData = {
  equityAndLiabilities: [
    { metric: 'Equity Share Capital',    value: 0.03,   bold: false },
    { metric: 'Preference Share Capital', value: 0.20,  bold: false },
    { metric: 'Reserves & Surplus',      value: 216.47, bold: false },
    { metric: 'Total Equity',            value: 216.70, bold: true },
    { metric: 'Secured Loans',           value: 0.13,   bold: false },
    { metric: 'Sundry Creditors',        value: 4.24,   bold: false },
    { metric: 'Duties & Taxes',          value: 1.76,   bold: false },
    { metric: 'Provisions',              value: 0.42,   bold: false },
    { metric: 'Other Current Liabilities', value: 0.44, bold: false },
    { metric: 'Total Liabilities',       value: 6.99,   bold: true },
    { metric: 'TOTAL',                   value: 223.69, bold: true },
  ],
  assets: [
    { metric: 'Fixed Assets (net)',      value: 2.66,   bold: false },
    { metric: 'Investments',             value: 108.41, bold: false },
    { metric: 'Bank Accounts',           value: 3.39,   bold: false },
    { metric: 'Wallets & Payment Gateways', value: 3.53, bold: false },
    { metric: 'Sundry Debtors',          value: 0.001,  bold: false },
    { metric: 'Deposits & Prepaid',      value: 0.17,   bold: false },
    { metric: 'Other Current Assets',    value: 0.68,   bold: false },
    { metric: 'Loan to Director',        value: 0.75,   bold: false },
    { metric: 'Total Assets',            value: 119.59, bold: true },
  ],
};

// ── Asset Composition (for donut) ──────────────────────────────────────────

export const assetComposition = {
  centerLabel: '₹119.6 Cr',
  segments: [
    { label: 'Investments',   value: 108.41, color: '#00FFCC' },
    { label: 'Bank Accounts', value: 3.39,   color: '#FFB800' },
    { label: 'Wallets',       value: 3.53,   color: '#A855F7' },
    { label: 'Fixed Assets',  value: 2.66,   color: '#FF00E5' },
    { label: 'Other',         value: 1.60,   color: '#39FF14' },
  ],
};

// ── Cash & Liquidity ───────────────────────────────────────────────────────

export const cashLiquidityData = [
  { metric: 'Bank Accounts',              value: 3.39,   bold: false, sub: 'HDFC, ICICI, RBL, Kotak' },
  { metric: 'Payment Wallets',            value: 3.53,   bold: false, sub: 'Razorpay, PhonePe, Paytm, CashFree' },
  { metric: 'Cash & Bank Total',          value: 6.92,   bold: true },
  { metric: 'Fixed Deposits',             value: 35.20,  bold: false, sub: 'ICICI, Kotak, RBL, HDFC, Yes Bank' },
  { metric: 'Corporate Bonds',            value: 31.78,  bold: false },
  { metric: 'Corporate FDs',              value: 14.28,  bold: false },
  { metric: 'Mutual Funds',               value: 27.31,  bold: false },
  { metric: 'Total Investments',          value: 108.41, bold: true },
  { metric: 'TOTAL LIQUIDITY',            value: 115.33, bold: true },
];

// ── Cash Position Chart (monthly total liquidity = Bank + Investments) ─────

export const cashPositionChart = {
  months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  bankBalance: [6.68, 3.73, 11.99, 1.55, 11.85, 3.77, 0.71, 3.31, 0.84, 15.05, 7.22, 33.91],
  investments: [105.52, 124.75, 399.21, 419.28, 428.13, 1104.39, 1117.58, 1145.19, 1130.85, 1122.03, 1097.58, 1084.08],
  totalLiquidity: [11.22, 12.85, 41.12, 42.08, 44.00, 110.82, 111.83, 114.85, 113.17, 113.71, 110.48, 111.80],
};

// ── Historical Trends (12-month for rev, exp, net profit) ──────────────────

export const historicalTrendsData = {
  months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  series: [
    { label: 'Revenue',     color: '#00FFCC', points: monthlyRevenue },
    { label: 'Expenses',    color: '#FF453A', points: monthlyExpenses },
    { label: 'Net Profit',  color: '#FFD700', points: monthlyNetProfit },
    { label: 'Other Income', color: '#A855F7', points: [0.01, 0.11, 0.02, 0.01, 0.04, 0.03, 0.02, 0.01, 0.42, 0.10, 0.06, 1.44] },
  ],
};

// ── Monthly Equity (Capital Account) for trends ────────────────────────────

export const equityTrend = {
  months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  data: [122.39, 122.39, 148.07, 148.39, 148.64, 214.98, 215.37, 216.70, 216.70, 216.70, 216.70, 216.70],
  color: '#A855F7',
};

// ── Debt/Equity Ratio ──────────────────────────────────────────────────────

export const debtEquity = {
  totalDebt: 0.13,     // Secured Loans
  totalEquity: 216.70, // Capital Account
  ratio: +(0.13 / 216.70).toFixed(4),
};
