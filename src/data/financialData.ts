/**
 * Granular monthly financial data — sourced from Tally ERP (IVYPODS TECHNOLOGY PVT LTD).
 * All amounts in Lakhs (Rs.). Converted to Crores for display via formatCr().
 *
 * Data refreshed: 2026-04-07 from group-level Trial Balance + exploded sub-accounts.
 */

import type { Period } from '../context/DashboardContext';

// ── Labels ─────────────────────────────────────────────────────────────────
export const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
export const CF_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// ── P&L Monthly Data (Rs. Lakhs) ───────────────────────────────────────────

/** Revenue sub-accounts */
export const monthlyInterStateSales = [306.22, 374.82, 414.86, 452.63, 429.10, 388.32, 351.97, 379.96, 410.02, 390.86, 325.84, 0.00];
export const monthlyIntraStateSales = [9.37, 11.76, 10.11, 12.21, 14.31, 16.06, 13.78, 15.54, 16.69, 15.48, 12.95, 0.00];
export const monthlyExportSales     = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.03, 0.00];

/** Total Revenue = sum of above */
export const monthlyRevenue = [315.59, 386.57, 424.97, 464.85, 443.42, 404.38, 365.75, 395.50, 426.71, 406.35, 338.82, 0.00];

/** Cost of Revenue */
export const monthlyCOGS = [6.43, 6.47, 6.61, 5.73, 5.63, 5.15, 5.06, 4.59, 4.70, 4.82, 4.79, 0.53];

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

/** Total OpEx per month */
export const monthlyTotalOpex = [183.26, 260.29, 331.72, 350.26, 302.13, 328.08, 348.44, 582.48, 472.25, 480.38, 457.19, 37.70];

/** EBITDA = Gross Profit - Total OpEx */
export const monthlyEBITDA = [125.90, 119.81, 86.64, 108.86, 135.65, 71.14, 12.25, -191.56, -50.24, -78.85, -123.16, -38.23];

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

export const monthlyOtherIncome = [0.57, 11.30, 1.85, 1.21, 4.10, 3.46, 2.18, 1.43, 42.39, 10.43, 8.81, 3.95];

/** PBT = EBIT + Other Income */
export const monthlyPBT = [125.46, 130.08, 87.38, 108.85, 138.47, 73.22, 12.48, -192.03, -9.79, -70.60, -117.12, -34.28];

/** Income Tax */
export const monthlyTax = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.13];

/** PAT = PBT - Tax */
export const monthlyPAT = [125.46, 130.08, 87.38, 108.85, 138.47, 73.22, 12.48, -192.03, -9.79, -70.60, -117.12, -34.41];

// ── Balance Sheet Monthly Data (Rs. Lakhs) ────────────────────────────────

export const monthlyNCA      = [1208.37, 1402.97, 4151.13, 4357.63, 4448.47, 11253.69, 11406.70, 11684.99, 11550.89, 11531.65, 11290.90, 11155.90];
export const monthlyCA       = [115.43, 93.50, 174.66, 77.67, 180.01, 90.66, 56.65, 100.54, 67.46, 221.46, 136.01, 726.76];
export const monthlyEquity   = [12239.15, 12488.55, 15195.75, 15316.13, 15450.10, 22223.04, 22335.75, 22481.39, 22303.67, 22293.94, 22223.32, 22103.12];
export const monthlyNCL      = [31.32, 29.70, 28.06, 26.40, 24.74, 23.06, 45.38, 19.67, 17.95, 16.45, 14.87, 13.31];
export const monthlyCL       = [713.25, 551.27, 647.09, 563.81, 518.62, 466.37, 467.69, 809.95, 648.25, 717.78, 784.82, 672.51];

/** Total Assets = NCA + CA */
export const monthlyTotalAssets = monthlyNCA.map((n, i) => +(n + monthlyCA[i]).toFixed(2));

// ── Cash Flow Monthly Data (Rs. Lakhs) — May25 to Mar26 ──────────────────

export const monthlyOCF = [-34.06, 188.57, 16.90, 101.38, 28.70, 18.83, 138.11, -168.43, -1.56, -43.72, -141.44];
export const monthlyICF = [-195.62, -2749.26, -207.72, -92.12, -6806.60, -154.96, -280.18, 132.16, 17.06, 237.98, 135.00];
export const monthlyFCF = [-1.63, 2.71, -1.60, -1.62, 6.05, 22.37, -24.94, -1.72, -1.50, -1.58, -1.56];

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
    children: [
      { label: 'Inter-State Sales', monthly: monthlyInterStateSales, ytd: sumArr(monthlyInterStateSales), indent: true },
      { label: 'Intra-State Sales', monthly: monthlyIntraStateSales, ytd: sumArr(monthlyIntraStateSales), indent: true },
      { label: 'Export Sales', monthly: monthlyExportSales, ytd: sumArr(monthlyExportSales), indent: true },
    ],
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
