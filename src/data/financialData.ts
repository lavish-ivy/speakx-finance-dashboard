/**
 * Granular monthly financial data — sourced from Tally ERP (IVYPODS TECHNOLOGY PVT LTD).
 * All amounts in Lakhs (Rs.). Converted to Crores for display via formatCr().
 *
 * Data refreshed: 2026-04-09 from group-level Trial Balance (live Tally sync).
 * Top-line P&L and BS from Tally group-level TB. OpEx sub-categories from ledger-level reference.
 */

import type { Period } from '../context/DashboardContext';

// ── Labels ─────────────────────────────────────────────────────────────────
export const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
export const CF_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// ── P&L Monthly Data (Rs. Lakhs) ───────────────────────────────────────────

/** Total Revenue (updated from Tally group-level TB 2026-04-09) */
export const monthlyRevenue = [438.61, 387.76, 426.80, 465.06, 443.44, 404.69, 365.75, 395.50, 426.73, 406.42, 339.19, 190.14];

/** Cost of Revenue (updated from Tally 2026-04-09) */
export const monthlyCOGS = [6.43, 6.47, 6.61, 5.73, 5.63, 5.15, 5.06, 4.59, 4.70, 4.82, 4.79, 5.90];

/** Gross Profit = Revenue - COGS */
export const monthlyGrossProfit = monthlyRevenue.map((r, i) => +(r - monthlyCOGS[i]).toFixed(2));

/** OpEx sub-categories (monthly, Rs. Lakhs) */
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

/** Total OpEx per month (updated from Tally 2026-04-09) */
export const monthlyTotalOpex = [183.35, 253.40, 333.04, 351.61, 303.55, 328.93, 350.17, 570.06, 474.17, 482.66, 459.98, 564.25];

/** EBITDA = Gross Profit - Total OpEx (updated from Tally 2026-04-09) */
export const monthlyEBITDA = [249.40, 139.18, 88.99, 108.94, 138.37, 74.07, 12.70, -177.72, -9.75, -70.62, -120.03, -235.63];

/** Depreciation */
export const monthlyDepreciation = [1.01, 1.03, 1.10, 1.22, 1.28, 1.38, 1.95, 1.90, 1.94, 2.18, 2.77, 0.00];

/** EBIT = EBITDA - Depreciation */
export const monthlyEBIT = monthlyEBITDA.map((e, i) => +(e - monthlyDepreciation[i]).toFixed(2));

/** Other Income sub-categories */
export const otherIncomeMonthly = {
  mutualFundIncome:  [0.08, 10.79, 1.35, 0.70, 3.59, 2.81, 1.67, 0.93, 13.38, 9.92, 4.91, 0.00],
  interestOnFD:      [0.00, 0.00, 0.00, 0.00, 0.00, 0.16, 0.00, 0.00, 28.51, 0.00, 0.00, 0.00],
  interestOnLoans:   [0.49, 0.51, 0.49, 0.51, 0.51, 0.49, 0.51, 0.49, 0.51, 0.51, 0.46, 0.51],
  incomeTaxRefund:   [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3.44, 3.44],
};

export const monthlyOtherIncome = [0.57, 11.30, 1.85, 1.21, 4.10, 3.46, 2.18, 1.43, 42.39, 10.43, 5.55, 144.38];

/** PBT = EBIT + Other Income (auto-computed) */
export const monthlyPBT = monthlyEBIT.map((e, i) => +(e + monthlyOtherIncome[i]).toFixed(2));

/** Income Tax */
export const monthlyTax = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.13];

/** PAT = PBT - Tax (auto-computed) */
export const monthlyPAT = monthlyPBT.map((p, i) => +(p - monthlyTax[i]).toFixed(2));

// ── Balance Sheet Monthly Data (Rs. Lakhs) ────────────────────────────────

export const monthlyNCA      = [1130.32, 1324.92, 4073.08, 4279.58, 4370.42, 11175.64, 11328.65, 11605.79, 11468.34, 11449.10, 11208.35, 11200.62];
export const monthlyCA       = [193.48, 171.55, 252.71, 155.70, 258.04, 168.69, 134.70, 179.74, 150.00, 156.28, 215.29, 195.56];
export const monthlyEquity   = [944.36, 1193.76, 3900.96, 4021.34, 4155.32, 10928.26, 11040.96, 11186.61, 11008.89, 10999.15, 10928.53, 10808.50];
export const monthlyNCL      = [31.34, 29.71, 28.06, 26.40, 24.74, 23.06, 45.38, 19.67, 17.95, 16.38, 14.87, 13.31];
export const monthlyCL       = [98.72, 133.83, 307.79, 278.60, 310.03, 318.94, 364.30, 756.97, 601.25, 660.48, 600.28, 810.00];

/** Total Assets = NCA + CA */
export const monthlyTotalAssets = monthlyNCA.map((n, i) => +(n + monthlyCA[i]).toFixed(2));

// ── Cash Flow Monthly Data (Rs. Lakhs) — May25 to Mar26 ──────────────────
// Derived from month-over-month Balance Sheet changes (group-level approximation).
// ICF = -ΔNCA (investing), FCF = ΔNCL (financing), OCF = ΔEquity + ΔCL - ΔCA (operating residual).

export const monthlyICF = Array.from({ length: 11 }, (_, i) => +(-(monthlyNCA[i + 1] - monthlyNCA[i])).toFixed(2));
export const monthlyFCF = Array.from({ length: 11 }, (_, i) => +(monthlyNCL[i + 1] - monthlyNCL[i]).toFixed(2));
export const monthlyOCF = Array.from({ length: 11 }, (_, i) =>
  +((monthlyEquity[i + 1] - monthlyEquity[i]) + (monthlyCL[i + 1] - monthlyCL[i]) - (monthlyCA[i + 1] - monthlyCA[i])).toFixed(2)
);

/** Net Cash Flow = OCF + ICF + FCF */
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
