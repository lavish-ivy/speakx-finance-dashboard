/**
 * Granular monthly financial data — sourced from Tally ERP (IVYPODS TECHNOLOGY PVT LTD).
 * All amounts in Lakhs (Rs.). Converted to Crores for display via formatCr().
 *
 * Data refreshed: 2026-04-10 from live group-level Trial Balance (12 monthly calls).
 * Top-line P&L and BS snapshots from Tally group-level TB. OpEx sub-categories from
 * ledger-level reference (sub-cats do NOT reconcile to Total OpEx — see comment on
 * opexMonthly below).
 *
 * IMPORTANT: This file is the SINGLE SOURCE OF TRUTH for the dashboard. Any aggregate
 * consumed by mockData.ts, v2Data.ts, or HUD panels must be derived here. See
 * validateFinancialData() at the bottom of this file — it runs on module load and
 * throws if sums or the balance-sheet equation drift.
 */

import type { Period } from '../context/DashboardContext';

// ── Labels ─────────────────────────────────────────────────────────────────
export const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
export const CF_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// ── P&L Monthly Data (Rs. Lakhs) ───────────────────────────────────────────

/** Total Revenue (Sales Accounts period activity, Tally 2026-04-10) */
export const monthlyRevenue = [438.61, 387.76, 426.80, 465.06, 443.44, 404.69, 365.75, 395.50, 426.73, 406.42, 339.19, 190.14];

/** Cost of Revenue (Direct Expenses period activity, Tally 2026-04-10) */
export const monthlyCOGS = [6.43, 6.47, 6.61, 5.73, 5.63, 5.15, 5.06, 4.59, 4.70, 4.82, 4.79, 5.90];

/** Gross Profit = Revenue - COGS */
export const monthlyGrossProfit = monthlyRevenue.map((r, i) => +(r - monthlyCOGS[i]).toFixed(2));

/**
 * OpEx sub-categories (monthly, Rs. Lakhs).
 *
 * WARNING: These come from ledger-level reference data and DO NOT sum to
 * monthlyTotalOpex (group-level). The drift is largest in Nov-Mar (late-year
 * adjustments, ESOP provisions, ISO/audit entries). Do not expand sub-categories
 * alongside the parent without a reconciliation footer.
 */
export const opexMonthly = {
  employeeBenefits:    [53.31, 57.08, 86.59, 60.19, 54.08, 110.64, 91.77, 227.39, 95.79, 116.13, 106.78, 0.55],
  performanceMarketing:[112.85, 146.32, 176.08, 192.91, 183.85, 157.32, 157.83, 287.77, 329.74, 298.93, 279.28, 19.40],
  itExpenses:          [1.48, 36.74, 30.14, 43.95, 40.02, 28.23, 37.38, 19.07, 21.47, 28.69, 49.75, 3.28],
  professionalCharges: [0.95, 3.22, 5.86, 33.73, 4.06, 2.50, 47.33, 22.55, 5.06, 19.44, 9.58, 4.69],
  auditFees:           [0.00, 0.00, 0.00, 0.00, 0.00, 7.08, 0.00, 7.34, 0.00, 0.00, 0.00, 0.00],
  freelancerServices:  [0.20, 0.30, 0.00, 0.00, 0.00, 0.90, 0.07, 1.56, 2.84, 0.70, 5.76, 3.25],
  financeCharges:      [10.20, 12.20, 26.80, 14.24, 12.64, 16.17, 5.41, 3.75, 8.88, 8.77, 0.66, 0.05],
  officeExpenses:      [1.34, 0.53, 0.92, 1.50, 0.85, 1.91, 3.00, 2.62, 1.34, 0.81, 0.51, 0.50],
  rent:                [1.34, 1.34, 1.34, 1.44, 1.44, 1.44, 1.44, 1.44, 1.49, 1.49, 1.49, 2.89],
  travelConveyance:    [0.69, 1.10, 3.13, 0.87, 3.61, 0.73, 0.92, 3.50, 4.02, 4.51, 1.61, 0.37],
  telephone:           [0.18, 0.14, 0.16, 0.48, 0.17, 0.36, 1.13, 0.23, 0.26, 0.52, 0.40, 0.26],
  insurance:           [0.19, 0.19, 0.21, 0.21, 0.21, 0.21, 0.21, 0.21, 0.21, 0.21, 0.22, 2.36],
  repairsMaintenance:  [0.13, 0.36, 0.14, 0.44, 0.32, 0.54, 0.27, 0.06, 0.90, 0.12, 0.29, 0.10],
  otherMisc:           [0.39, 0.77, 0.35, 0.79, 0.88, 0.05, 0.67, 5.00, 1.23, 0.28, 0.86, 0.00],
};

/** Total OpEx per month (Indirect Expenses period activity, Tally cache 2026-04-09) */
export const monthlyTotalOpex = [183.35, 253.40, 333.04, 351.61, 303.55, 328.93, 350.17, 570.06, 474.17, 482.66, 459.98, 564.25];

/**
 * EBITDA = Gross Profit − Total OpEx (auto-computed — DO NOT store).
 *
 * Prior versions stored a hand-entered array here that was actually
 * `GP − OpEx + OtherIncome` (i.e. PBT-ex-depreciation). That silent mislabel
 * caused the "₹1.98 Cr net profit" that leaked into mockData. True YTD EBITDA
 * is −₹0.31 Cr — the business flipped loss-making from Nov-25 onwards.
 */
export const monthlyEBITDA = monthlyGrossProfit.map((g, i) => +(g - monthlyTotalOpex[i]).toFixed(2));

/** Depreciation (Tally group-level is folded into Indirect Expenses — kept as 0 to avoid double-count) */
export const monthlyDepreciation = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

/** EBIT = EBITDA − Depreciation (auto-computed) */
export const monthlyEBIT = monthlyEBITDA.map((e, i) => +(e - monthlyDepreciation[i]).toFixed(2));

/**
 * Other Income sub-categories (ledger-level reference).
 *
 * WARNING: These do NOT reconcile to monthlyOtherIncome (group-level). March in
 * particular has a large year-end MF redemption / tax refund booking that
 * isn't broken out at ledger level.
 */
export const otherIncomeMonthly = {
  mutualFundIncome:  [0.08, 10.79, 1.35, 0.70, 3.59, 2.81, 1.67, 0.93, 13.38, 9.92, 4.91, 0.00],
  interestOnFD:      [0.00, 0.00, 0.00, 0.00, 0.00, 0.16, 0.00, 0.00, 28.51, 0.00, 0.00, 0.00],
  interestOnLoans:   [0.49, 0.51, 0.49, 0.51, 0.51, 0.49, 0.51, 0.49, 0.51, 0.51, 0.46, 0.51],
  incomeTaxRefund:   [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3.44, 3.44],
};

/** Other Income (Indirect Incomes period activity, Tally cache 2026-04-09) */
export const monthlyOtherIncome = [0.57, 11.30, 1.85, 1.21, 4.10, 3.46, 2.18, 1.43, 42.39, 10.43, 5.55, 144.38];

/** PBT = EBIT + Other Income (auto-computed) */
export const monthlyPBT = monthlyEBIT.map((e, i) => +(e + monthlyOtherIncome[i]).toFixed(2));

/** Income Tax (not yet booked in FY26 group TB — placeholder) */
export const monthlyTax = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00];

/** PAT = PBT − Tax (auto-computed) */
export const monthlyPAT = monthlyPBT.map((p, i) => +(p - monthlyTax[i]).toFixed(2));

// ── Balance Sheet Monthly Data (Rs. Lakhs, month-end closing, Tally cache 2026-04-09) ──

/**
 * NCA sub-heads (Tally group-level closing balances).
 * monthlyNCA === monthlyFixedAssets + monthlyInvestments (per-month).
 */
export const monthlyFixedAssets = [75.10, 77.47, 81.01, 86.83, 89.16, 131.73, 152.81, 153.87, 162.72, 231.62, 235.45, 232.56];
export const monthlyInvestments = [1055.23, 1247.45, 3992.08, 4192.75, 4281.26, 11043.91, 11175.84, 11451.92, 11305.62, 11217.47, 10972.90, 10968.06];

/** Non-Current Assets = Fixed Assets + Investments */
export const monthlyNCA = monthlyFixedAssets.map((f, i) => +(f + monthlyInvestments[i]).toFixed(2));

/** Current Assets (Tally group-level closing) */
export const monthlyCA       = [193.48, 171.55, 252.71, 155.70, 258.04, 168.69, 134.70, 179.74, 150.00, 156.28, 215.29, 195.56];

/** Non-Current Liabilities = Loans (Liability) */
export const monthlyNCL      = [31.34, 29.71, 28.06, 26.40, 24.74, 23.06, 45.38, 19.67, 17.95, 16.38, 14.87, 13.31];

/** Current Liabilities */
export const monthlyCL       = [98.72, 133.83, 307.79, 278.60, 310.03, 318.94, 364.30, 756.97, 601.25, 660.48, 600.28, 810.00];

/**
 * Equity sub-heads (Tally group-level closing balances).
 *
 * Capital Account = paid-up share capital + securities premium + reserves
 *                   (pre-P&L-transfer balance at month-end).
 * Profit & Loss A/c = cumulative retained earnings closing balance as shown in
 *                     Tally's Trial Balance — this already absorbs the transfer
 *                     of prior-period P&L. The current period's flow sits in
 *                     Sales/Expenses ledgers until year-end closing.
 *
 * Total Equity (below) = Capital + P&L A/c, which matches the equity Tally shows
 * on its Balance Sheet report (verified 2026-04-09 against user screenshot:
 * Mar-26 Equity = 108.08 Cr).
 */
export const monthlyCapital    = [944.36, 944.36, 3512.38, 3543.77, 3568.81, 10203.38, 10242.02, 10374.97, 10374.97, 10374.97, 10374.97, 10374.97];
export const monthlyPnLAccount = [0.00, 249.40, 388.58, 477.57, 586.51, 724.88, 798.94, 811.64, 633.92, 624.18, 553.56, 433.53];

/** Total Equity = Capital Account + Profit & Loss A/c (Tally TB closing balances) */
export const monthlyEquity = monthlyCapital.map((c, i) => +(c + monthlyPnLAccount[i]).toFixed(2));

/** Total Assets = NCA + CA */
export const monthlyTotalAssets = monthlyNCA.map((n, i) => +(n + monthlyCA[i]).toFixed(2));

// ── Cash Flow Monthly Data (Rs. Lakhs) — May25 to Mar26 ──────────────────
// Indirect method derived from month-over-month BS changes.
//   FCF (financing) = Δcapital + ΔNCL   — fundraises and debt draws
//   ICF (investing) = -ΔNCA              — investments and capex spend (negative when cash leaves)
//   OCF (operating) = PBT + ΔCL - ΔCA (prior month) — earnings + WC movement on the cash pool
// These are a group-level approximation; a true direct-method CF would require
// voucher-level data (which cannot be fetched over the cloud Tally link).

export const monthlyFCF = Array.from({ length: 11 }, (_, i) =>
  +(
    (monthlyCapital[i + 1] - monthlyCapital[i]) +
    (monthlyNCL[i + 1] - monthlyNCL[i])
  ).toFixed(2),
);
export const monthlyICF = Array.from({ length: 11 }, (_, i) =>
  +(-(monthlyNCA[i + 1] - monthlyNCA[i])).toFixed(2),
);
export const monthlyOCF = Array.from({ length: 11 }, (_, i) =>
  +(
    monthlyPBT[i + 1] +
    (monthlyCL[i + 1] - monthlyCL[i]) -
    (monthlyCA[i + 1] - monthlyCA[i])
  ).toFixed(2),
);

/** Net Cash Flow = OCF + ICF + FCF (should ≈ ΔCA month-over-month) */
export const monthlyNetCF = monthlyOCF.map((o, i) => +(o + monthlyICF[i] + monthlyFCF[i]).toFixed(2));

// ── P&L Grouped Row Structure (for expandable table) ──────────────────────

export interface PnlRow {
  label: string;
  monthly: number[];
  ytd: number;
  bold?: boolean;
  indent?: boolean;
  highlight?: boolean;
  pctRow?: boolean;
  children?: PnlRow[];
}

const sumArr = (arr: number[]) => +arr.reduce((a, b) => a + b, 0).toFixed(2);

export const pnlStructure: PnlRow[] = [
  {
    label: 'Total Revenue',
    monthly: monthlyRevenue,
    ytd: sumArr(monthlyRevenue),
    bold: true,
  },
  {
    label: 'Cost of Revenue',
    monthly: monthlyCOGS,
    ytd: sumArr(monthlyCOGS),
  },
  {
    label: 'Gross Profit',
    monthly: monthlyGrossProfit,
    ytd: sumArr(monthlyGrossProfit),
    bold: true,
    highlight: true,
  },
  {
    label: 'Gross Margin %',
    monthly: monthlyRevenue.map((r, i) => r === 0 ? 0 : +((monthlyGrossProfit[i] / r) * 100).toFixed(1)),
    ytd: +((sumArr(monthlyGrossProfit) / sumArr(monthlyRevenue)) * 100).toFixed(1),
    pctRow: true,
  },
  {
    label: 'Total OpEx',
    monthly: monthlyTotalOpex,
    ytd: sumArr(monthlyTotalOpex),
    bold: true,
    children: [
      { label: 'Employee Benefits', monthly: opexMonthly.employeeBenefits, ytd: sumArr(opexMonthly.employeeBenefits), indent: true },
      { label: 'Performance Marketing', monthly: opexMonthly.performanceMarketing, ytd: sumArr(opexMonthly.performanceMarketing), indent: true },
      { label: 'IT Expenses', monthly: opexMonthly.itExpenses, ytd: sumArr(opexMonthly.itExpenses), indent: true },
      { label: 'Professional Charges', monthly: opexMonthly.professionalCharges, ytd: sumArr(opexMonthly.professionalCharges), indent: true },
      { label: 'Finance Charges', monthly: opexMonthly.financeCharges, ytd: sumArr(opexMonthly.financeCharges), indent: true },
      { label: 'Audit Fees', monthly: opexMonthly.auditFees, ytd: sumArr(opexMonthly.auditFees), indent: true },
      { label: 'Freelancer Services', monthly: opexMonthly.freelancerServices, ytd: sumArr(opexMonthly.freelancerServices), indent: true },
      { label: 'Rent', monthly: opexMonthly.rent, ytd: sumArr(opexMonthly.rent), indent: true },
      { label: 'Travel & Conveyance', monthly: opexMonthly.travelConveyance, ytd: sumArr(opexMonthly.travelConveyance), indent: true },
      { label: 'Office Expenses', monthly: opexMonthly.officeExpenses, ytd: sumArr(opexMonthly.officeExpenses), indent: true },
      { label: 'Telephone', monthly: opexMonthly.telephone, ytd: sumArr(opexMonthly.telephone), indent: true },
      { label: 'Insurance', monthly: opexMonthly.insurance, ytd: sumArr(opexMonthly.insurance), indent: true },
      { label: 'Repairs & Maintenance', monthly: opexMonthly.repairsMaintenance, ytd: sumArr(opexMonthly.repairsMaintenance), indent: true },
      { label: 'Other Misc', monthly: opexMonthly.otherMisc, ytd: sumArr(opexMonthly.otherMisc), indent: true },
    ],
  },
  {
    label: 'EBITDA',
    monthly: monthlyEBITDA,
    ytd: sumArr(monthlyEBITDA),
    bold: true,
    highlight: true,
  },
  {
    label: 'EBITDA Margin %',
    monthly: monthlyRevenue.map((r, i) => r === 0 ? 0 : +((monthlyEBITDA[i] / r) * 100).toFixed(1)),
    ytd: +((sumArr(monthlyEBITDA) / sumArr(monthlyRevenue)) * 100).toFixed(1),
    pctRow: true,
  },
  {
    label: 'Depreciation',
    monthly: monthlyDepreciation,
    ytd: sumArr(monthlyDepreciation),
  },
  {
    label: 'EBIT',
    monthly: monthlyEBIT,
    ytd: sumArr(monthlyEBIT),
    bold: true,
  },
  {
    label: 'Total Other Income',
    monthly: monthlyOtherIncome,
    ytd: sumArr(monthlyOtherIncome),
    bold: true,
    children: [
      { label: 'Mutual Fund Income', monthly: otherIncomeMonthly.mutualFundIncome, ytd: sumArr(otherIncomeMonthly.mutualFundIncome), indent: true },
      { label: 'Interest on FD', monthly: otherIncomeMonthly.interestOnFD, ytd: sumArr(otherIncomeMonthly.interestOnFD), indent: true },
      { label: 'Interest on Loans', monthly: otherIncomeMonthly.interestOnLoans, ytd: sumArr(otherIncomeMonthly.interestOnLoans), indent: true },
      { label: 'Income Tax Refund', monthly: otherIncomeMonthly.incomeTaxRefund, ytd: sumArr(otherIncomeMonthly.incomeTaxRefund), indent: true },
    ],
  },
  {
    label: 'Profit Before Tax',
    monthly: monthlyPBT,
    ytd: sumArr(monthlyPBT),
    bold: true,
    highlight: true,
  },
  {
    label: 'Income Tax',
    monthly: monthlyTax,
    ytd: sumArr(monthlyTax),
  },
  {
    label: 'Profit After Tax',
    monthly: monthlyPAT,
    ytd: sumArr(monthlyPAT),
    bold: true,
    highlight: true,
  },
];

// ── Aggregation Utilities ──────────────────────────────────────────────────

/** Sum groups of 3 months into quarterly values */
function toQuarterly(monthly: number[]): number[] {
  return [
    +(monthly[0] + monthly[1] + monthly[2]).toFixed(2),
    +(monthly[3] + monthly[4] + monthly[5]).toFixed(2),
    +(monthly[6] + monthly[7] + monthly[8]).toFixed(2),
    +(monthly[9] + monthly[10] + monthly[11]).toFixed(2),
  ];
}

/** Sum entire array into a single annual value */
function toAnnual(monthly: number[]): number[] {
  return [+monthly.reduce((a, b) => a + b, 0).toFixed(2)];
}

/** For balance sheet: take the last month of each quarter (snapshot) */
function toQuarterlySnapshot(monthly: number[]): number[] {
  return [monthly[2], monthly[5], monthly[8], monthly[11]];
}

function toAnnualSnapshot(monthly: number[]): number[] {
  return [monthly[11]];
}

/** Aggregate a monthly array based on period, optionally as snapshot */
export function aggregate(monthly: number[], period: Period, snapshot = false): number[] {
  if (period === 'M') return monthly;
  if (period === 'Q') return snapshot ? toQuarterlySnapshot(monthly) : toQuarterly(monthly);
  return snapshot ? toAnnualSnapshot(monthly) : toAnnual(monthly);
}

/** Get labels for a given period */
export function periodLabels(period: Period): string[] {
  if (period === 'M') return MONTHS;
  if (period === 'Q') return QUARTERS;
  return ['FY26'];
}

/** Aggregate CF data (11-month arrays: May–Mar) */
export function aggregateCF(monthly: number[], period: Period): number[] {
  if (period === 'M') return monthly;
  if (period === 'Q') {
    // Q1: May, Jun (2 months — Apr is base)
    // Q2: Jul, Aug, Sep
    // Q3: Oct, Nov, Dec
    // Q4: Jan, Feb, Mar
    return [
      +(monthly[0] + monthly[1]).toFixed(2),
      +(monthly[2] + monthly[3] + monthly[4]).toFixed(2),
      +(monthly[5] + monthly[6] + monthly[7]).toFixed(2),
      +(monthly[8] + monthly[9] + monthly[10]).toFixed(2),
    ];
  }
  return [+monthly.reduce((a, b) => a + b, 0).toFixed(2)];
}

export function cfPeriodLabels(period: Period): string[] {
  if (period === 'M') return CF_MONTHS;
  if (period === 'Q') return QUARTERS;
  return ['FY26'];
}

// ── Formatting ─────────────────────────────────────────────────────────────

/** Convert Lakhs to Crores and format */
export function formatCr(lakhs: number): string {
  const cr = lakhs / 100;
  if (Math.abs(cr) < 0.01 && cr !== 0) {
    return `₹${lakhs.toFixed(1)} L`;
  }
  return `₹${cr.toFixed(2)} Cr`;
}

/** Format a percentage */
export function formatPct(val: number): string {
  return `${val.toFixed(1)}%`;
}

// ── OpEx series for stacked chart ──────────────────────────────────────────

export const opexChartSeries = [
  { label: 'Performance Marketing', color: '#FF9F0A', data: opexMonthly.performanceMarketing },
  { label: 'Employee Benefits', color: '#BF5AF2', data: opexMonthly.employeeBenefits },
  { label: 'IT Expenses', color: '#00FFCC', data: opexMonthly.itExpenses },
  { label: 'Professional Charges', color: '#64D2FF', data: opexMonthly.professionalCharges },
  { label: 'Finance Charges', color: '#FFD700', data: opexMonthly.financeCharges },
  { label: 'Other OpEx', color: '#8A8F98', data: (() => {
    // Sum all the smaller categories
    const other = opexMonthly.auditFees.map((_, i) =>
      +(opexMonthly.auditFees[i] + opexMonthly.freelancerServices[i] + opexMonthly.officeExpenses[i] +
        opexMonthly.rent[i] + opexMonthly.travelConveyance[i] + opexMonthly.telephone[i] +
        opexMonthly.insurance[i] + opexMonthly.repairsMaintenance[i] + opexMonthly.otherMisc[i]).toFixed(2)
    );
    return other;
  })() },
];

// ── Data validation — runs once at module load ─────────────────────────────
// Catches silent drift between stored arrays, the BS equation, and internal
// derivations. Any failure throws on module init so the dashboard refuses to
// render stale or contradictory data instead of quietly showing wrong numbers.

interface ValidationIssue {
  check: string;
  detail: string;
}

function validateFinancialData(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tol = 0.5; // Lakhs — allow half-a-lakh rounding drift between sources

  // 1. Array lengths consistent
  const arrays = {
    monthlyRevenue,
    monthlyCOGS,
    monthlyTotalOpex,
    monthlyOtherIncome,
    monthlyNCA,
    monthlyCA,
    monthlyNCL,
    monthlyCL,
    monthlyEquity,
  };
  for (const [name, arr] of Object.entries(arrays)) {
    if (arr.length !== 12) {
      issues.push({ check: 'array-length', detail: `${name} has ${arr.length} entries, expected 12` });
    }
  }

  // 2. Balance-sheet equation holds each month: A = E + L + PBT[M]
  //    (PBT[M] is the current month's operating flow that hasn't yet been
  //    closed to the P&L A/c group — Tally carries it in Sales/Expenses
  //    ledgers until year-end. The displayed Equity at month M is
  //    Capital[M] + P&L_A/c[M] where P&L_A/c[M] = cum(PBT[Apr..M-1]).)
  for (let i = 0; i < 12; i++) {
    const assets = monthlyNCA[i] + monthlyCA[i];
    const liabEquity = monthlyEquity[i] + monthlyNCL[i] + monthlyCL[i] + monthlyPBT[i];
    const drift = Math.abs(assets - liabEquity);
    if (drift > tol) {
      issues.push({
        check: 'bs-equation',
        detail: `${MONTHS[i]}-26: Assets ${assets.toFixed(2)} L vs (E+L+PBT) ${liabEquity.toFixed(2)} L — drift ${drift.toFixed(2)} L`,
      });
    }
  }

  // 3. EBITDA derivation holds (stored EBITDA = GP − TotalOpEx)
  for (let i = 0; i < 12; i++) {
    const expected = monthlyGrossProfit[i] - monthlyTotalOpex[i];
    if (Math.abs(monthlyEBITDA[i] - expected) > tol) {
      issues.push({
        check: 'ebitda-formula',
        detail: `${MONTHS[i]}: EBITDA ${monthlyEBITDA[i]} ≠ GP ${monthlyGrossProfit[i]} − OpEx ${monthlyTotalOpex[i]}`,
      });
    }
  }

  // 4. PBT equals EBIT + OtherIncome
  for (let i = 0; i < 12; i++) {
    const expected = monthlyEBIT[i] + monthlyOtherIncome[i];
    if (Math.abs(monthlyPBT[i] - expected) > tol) {
      issues.push({
        check: 'pbt-formula',
        detail: `${MONTHS[i]}: PBT ${monthlyPBT[i]} ≠ EBIT ${monthlyEBIT[i]} + OI ${monthlyOtherIncome[i]}`,
      });
    }
  }

  return issues;
}

const validationIssues = validateFinancialData();
if (validationIssues.length > 0) {
  // Log every issue, then throw. In dev the dashboard will crash visibly with
  // a meaningful stack, rather than silently showing wrong numbers.
  const summary = validationIssues
    .map((i) => `  [${i.check}] ${i.detail}`)
    .join('\n');
  const msg = `financialData validation failed:\n${summary}`;
  // eslint-disable-next-line no-console
  console.error(msg);
  throw new Error(msg);
}
