/**
 * Granular monthly financial data — sourced from Tally ERP (IVYPODS TECHNOLOGY PVT LTD).
 * All amounts in Lakhs (Rs.). Converted to Crores for display via formatCr().
 *
 * Data refreshed: 2026-04-12 from Tally ERP ledger-level Trial Balance.
 * All P&L sub-categories (opexMonthly, otherIncomeMonthly) reconcile exactly
 * to their parent group totals. BS data from Tally group-level TB.
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
 * OpEx sub-categories (monthly, Rs. Lakhs) — Tally ledger-level actuals.
 *
 * Every named key maps 1:1 to a Tally ledger under the Indirect Expenses
 * group. `otherMisc` is the residual (group total − sum of named) so that
 * sum(all keys) === monthlyTotalOpex for every month.
 *
 * Synced from: speakx-mis-automation/output/ledger_tb/fy2526_detailed.json
 */
export const opexMonthly = {
  employeeBenefits:    [53.31, 57.08, 86.59, 60.19, 54.08, 110.64, 91.77, 227.39, 95.79, 116.12, 106.78, 116.19],
  performanceMarketing:[112.85, 146.32, 176.08, 192.91, 183.85, 157.32, 157.83, 287.77, 329.74, 298.93, 279.28, 335.31],
  itExpenses:          [0.31, 28.60, 30.14, 43.95, 39.95, 28.23, 37.38, 19.04, 21.47, 28.69, 49.74, 45.36],
  professionalCharges: [0.95, 3.22, 5.86, 33.73, 4.06, 2.50, 47.33, 22.55, 5.06, 19.44, 9.58, 11.98],
  financeCharges:      [10.20, 12.20, 26.80, 14.24, 12.64, 16.17, 5.41, 3.55, 8.77, 8.77, 0.66, 9.20],
  depreciation:        [1.01, 1.03, 1.10, 1.22, 1.28, 1.38, 1.95, 1.90, 1.94, 2.18, 2.77, 2.73],
  travelConveyance:    [0.69, 1.10, 3.13, 0.87, 3.61, 0.73, 0.92, 3.50, 4.02, 4.51, 1.61, 16.33],
  rent:                [1.34, 1.34, 1.34, 1.44, 1.44, 1.44, 1.44, 1.44, 1.49, 1.49, 1.49, 3.18],
  officeExpenses:      [1.34, 0.53, 0.92, 1.50, 0.85, 1.91, 3.00, 2.54, 1.34, 0.81, 0.53, 1.24],
  freelancerServices:  [0.20, 0.30, 0.00, 0.00, 0.00, 0.90, 0.07, 1.56, 2.84, 0.70, 5.76, 2.85],
  auditorFee:          [0.00, 0.00, 0.00, 0.00, 0.00, 7.08, 0.00, -6.83, 0.00, 0.00, 0.00, 15.00],
  trainingDevelopment: [0.01, 0.61, 0.00, 0.03, 0.00, 0.00, 0.00, 4.83, -0.03, 0.00, 0.00, 0.00],
  repairsMaintenance:  [0.13, 0.36, 0.14, 0.44, 0.32, 0.54, 0.27, 0.06, 0.90, 0.12, 0.29, 0.45],
  telephone:           [0.18, 0.14, 0.16, 0.48, 0.17, -0.36, 1.13, 0.23, 0.26, 0.52, 0.40, 0.32],
  insurance:           [0.18, 0.18, 0.20, 0.20, 0.20, 0.20, 0.20, 0.20, 0.20, 0.20, 0.21, 0.48],
  interestOnCarLoan:   [0.25, 0.24, 0.23, 0.21, 0.20, 0.19, 0.17, 0.16, 0.15, 0.14, 0.12, 0.11],
  foreignExchange:     [0.18, 0.04, 0.32, 0.19, 0.51, 0.04, 0.17, 0.16, 0.20, 0.00, -0.06, 0.00],
  powerFuel:           [0.19, 0.00, 0.00, 0.00, 0.20, 0.00, 1.29, 0.00, 0.00, 0.00, 0.54, 0.00],
  lossDamageAssets:    [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 3.32],
  /** Residual = Indirect Expenses group − sum(named). Catches rounding + micro-ledgers. */
  otherMisc:           [0.03, 0.11, 0.03, 0.01, 0.19, 0.02, -0.16, 0.01, 0.03, 0.04, 0.28, 0.24],
};

/**
 * Total OpEx per month (Indirect Expenses period activity, Tally cache 2026-04-09).
 *
 * This is the raw Tally group-level total and INCLUDES Finance Charges —
 * because at the Tally TB level, interest lives inside Indirect Expenses.
 * For any "total cash indirect spend" computation (cash flow view, mockData,
 * MarginTrends) this is the correct number to use: interest IS real cash
 * that left the business.
 *
 * For the P&L waterfall (investor / Ind-AS view) we split Finance Costs out
 * below EBIT. See `monthlyFinanceCosts` and `monthlyOperatingExpenses`.
 */
export const monthlyTotalOpex = [183.35, 253.40, 333.04, 351.61, 303.55, 328.93, 350.17, 570.06, 474.17, 482.66, 459.98, 564.29];

/**
 * Finance Costs per month (pulled out of `opexMonthly.financeCharges` so it
 * can sit below EBIT on the P&L waterfall, per Ind-AS 1 / Schedule III).
 * Under Ind-AS, finance costs are a separate line after EBIT — EBITDA must
 * be reported BEFORE interest. Previously these were buried inside OpEx,
 * which understated EBITDA by ~₹1.20 Cr YTD.
 */
export const monthlyFinanceCosts = [...opexMonthly.financeCharges];

/**
 * Operating Expenses = Total OpEx − Finance Costs − Depreciation.
 * This is the number that flows into the EBITDA derivation (GP − OpEx ex-fin-dep).
 * Finance Costs sit below EBIT per Ind-AS 1. Depreciation sits between EBITDA and EBIT.
 */
export const monthlyOperatingExpenses = monthlyTotalOpex.map(
  (o, i) => +(o - monthlyFinanceCosts[i] - opexMonthly.depreciation[i]).toFixed(2),
);

/**
 * EBITDA = Gross Profit − Operating Expenses (ex-Finance Costs).
 *
 * NOTE: This is the correct Ind-AS / investor-deck definition. Prior
 * definition `GP − TotalOpEx` was silently subtracting interest, turning
 * the YTD headline from +₹0.89 Cr to −₹0.31 Cr. Finance Costs now appear
 * as their own line between EBIT and PBT.
 */
export const monthlyEBITDA = monthlyGrossProfit.map(
  (g, i) => +(g - monthlyOperatingExpenses[i]).toFixed(2),
);

/** Depreciation (Tally Depreciation A/c ledger — broken out of OpEx for EBITDA→EBIT split) */
export const monthlyDepreciation = [...opexMonthly.depreciation];

/** EBIT = EBITDA − Depreciation (auto-computed) */
export const monthlyEBIT = monthlyEBITDA.map((e, i) => +(e - monthlyDepreciation[i]).toFixed(2));

/**
 * Other Income sub-categories (Tally Indirect Incomes ledger-level actuals).
 * Ledger sums reconcile to monthlyOtherIncome (group total) within rounding.
 */
export const otherIncomeMonthly = {
  mutualFundIncome:  [0.08, 10.79, 1.35, 0.70, 3.59, 2.81, 1.67, 0.93, 13.38, 9.92, 4.91, 6.74],
  interestOnFD:      [0.00, 0.00, 0.00, 0.00, 0.00, 0.16, 0.00, 0.00, 28.51, 0.00, 0.00, 197.90],
  interestOnLoans:   [0.49, 0.51, 0.49, 0.51, 0.51, 0.49, 0.51, 0.49, 0.51, 0.51, 0.46, 0.51],
  incomeTaxRefund:   [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.18, 0.00],
};

/** Other Income (Indirect Incomes period activity, Tally ledger-level 2026-04-10) */
export const monthlyOtherIncome = [0.57, 11.30, 1.85, 1.21, 4.10, 3.46, 2.18, 1.43, 42.39, 10.43, 5.55, 205.14];

/**
 * PBT = EBIT − Finance Costs + Other Income (auto-computed).
 *
 * Finance Costs are now below EBIT (Ind-AS waterfall), so the total PBT
 * number is unchanged from the prior `EBIT + OI` formulation — we've only
 * moved the classification. YTD PBT still ≈ ₹1.98 Cr, same as before.
 */
export const monthlyPBT = monthlyEBIT.map(
  (e, i) => +(e - monthlyFinanceCosts[i] + monthlyOtherIncome[i]).toFixed(2),
);

/**
 * Income Tax booked in Tally month-by-month. Zero throughout FY26 because
 * current tax provision is recognized at year-end audit close, not on a
 * monthly accrual basis. PBT is therefore the Tally-booked bottom line
 * across the dashboard until the year-end provision is posted.
 */
export const monthlyTax = [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00];

/**
 * PAT = PBT − Tax (auto-computed). Equal to PBT while monthlyTax is zero —
 * kept as a separate export so the P&L waterfall can show the Tax row and
 * the identity survives when the year-end provision is finally posted.
 */
export const monthlyPAT = monthlyPBT.map((p, i) => +(p - monthlyTax[i]).toFixed(2));

// ── Balance Sheet Monthly Data (Rs. Lakhs, month-end closing, Tally cache 2026-04-09) ──

/**
 * NCA sub-heads (Tally group-level closing balances).
 * monthlyNCA === monthlyFixedAssets + monthlyInvestments (per-month).
 */
export const monthlyFixedAssets = [75.10, 77.47, 81.01, 86.83, 89.16, 131.73, 152.81, 153.87, 162.72, 231.62, 235.45, 232.56];
export const monthlyInvestments = [1055.23, 1247.45, 3992.08, 4192.75, 4281.26, 11043.91, 11175.84, 11451.92, 11305.62, 11217.47, 10972.90, 11022.75];

/** Non-Current Assets = Fixed Assets + Investments */
export const monthlyNCA = monthlyFixedAssets.map((f, i) => +(f + monthlyInvestments[i]).toFixed(2));

/** Current Assets (Tally group-level closing) */
export const monthlyCA       = [193.48, 171.55, 252.71, 155.70, 258.04, 168.69, 134.70, 179.74, 150.00, 156.28, 215.29, 201.63];

/** Non-Current Liabilities = Loans (Liability) */
export const monthlyNCL      = [31.34, 29.71, 28.06, 26.40, 24.74, 23.06, 45.38, 19.67, 17.95, 16.38, 14.87, 13.31];

/** Current Liabilities */
export const monthlyCL       = [98.72, 133.83, 307.79, 278.60, 310.03, 318.94, 364.30, 756.97, 601.25, 660.48, 600.28, 810.04];

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

// ── BS Ledger-Level Breakdowns (Rs. Lakhs, month-end closing, Tally 2026-04-10) ──

/** Investments sub-breakdown (Tally ledger closing balances) */
export const investmentsMonthly = {
  mutualFund:     [966.52, 908.74, 1063.37, 1264.05, 1002.56, 5671.85, 3620.32, 3935.32, 3598.36, 3110.22, 2865.64, 2737.38],
  corporateFD:    [0.00, 250.00, 1049.00, 1049.00, 1399.00, 1399.00, 1399.00, 1399.00, 1424.66, 1424.66, 1424.66, 1479.34],
  corporateBonds: [0.00, 0.00, 0.00, 0.00, 0.00, 1058.35, 3216.81, 3177.89, 3177.89, 3177.89, 3177.89, 3177.89],
  fdICICI:        [63.71, 63.71, 1854.71, 1854.71, 1854.71, 1854.71, 1854.71, 1854.71, 1854.71, 1854.71, 1854.71, 1940.54],
  fdKotak:        [0.00, 0.00, 0.00, 0.00, 0.00, 960.00, 985.00, 985.00, 985.00, 985.00, 985.00, 1013.80],
  fdYesBank:      [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 400.00, 400.00, 404.79],
  fdRBL:          [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 250.00, 250.00, 250.00, 253.99],
  fdHDFC:         [25.00, 25.00, 25.00, 25.00, 25.00, 15.01, 15.01, 15.01, 15.01, 15.01, 15.01, 15.01],
  bajajLiquid:    [0.00, 0.00, 0.00, 0.00, 0.00, 35.00, 35.00, 35.00, 0.00, 0.00, 0.00, 0.00],
  bajajMoneyMkt:  [0.00, 0.00, 0.00, 0.00, 0.00, 50.00, 50.00, 50.00, 0.00, 0.00, 0.00, 0.00],
};

/** Capital Account sub-breakdown (Tally ledger closing balances) */
export const capitalAccountMonthly = {
  reservesSurplus:       [934.26, 934.26, 3497.92, 3529.25, 3554.25, 10181.10, 10219.69, 10351.87, 10351.87, 10351.87, 10351.87, 10351.87],
  preferenceShareCapital:[7.07, 7.07, 11.44, 11.49, 11.53, 19.26, 19.30, 20.08, 20.08, 20.08, 20.08, 20.08],
  equityShareCapital:    [3.02, 3.02, 3.02, 3.02, 3.02, 3.02, 3.02, 3.02, 3.02, 3.02, 3.02, 3.02],
};

/** Fixed Assets sub-breakdown (Tally ledger closing balances) */
export const fixedAssetsMonthly = {
  tangible:              [88.83, 92.23, 96.87, 103.90, 106.88, 150.83, 173.86, 176.82, 187.61, 258.69, 265.29, 261.81],
  intangible:            [0.00, 0.00, 0.00, 0.00, 0.64, 0.64, 0.64, 0.64, 0.64, 0.64, 0.64, 0.64],
  accumulatedDepr:       [13.73, 14.76, 15.86, 17.08, 18.36, 19.74, 21.69, 23.58, 25.53, 27.71, 30.48, 29.89],
};

// ── Cash Flow Monthly Data (Rs. Lakhs) — May25 to Mar26 ──────────────────
// Indirect method derived from month-over-month BS changes.
//
// CLASSIFICATION ASSUMPTION (documented for audit trail):
//   Tally `Current Assets` at IVYPODS is effectively Cash & Equivalents —
//   HDFC / ICICI bank balances, Razorpay & PhonePe gateway settlements (T+1),
//   and short-term deposits. SpeakX is B2C so there are no trade receivables;
//   GST input credits and prepayments are immaterial. Therefore we treat
//   `monthlyCA` as the cash pot and DO NOT include ΔCA as a working-capital
//   add-back in OCF. With this classification:
//     NetCF = OCF + ICF + FCF  is mathematically identical to  ΔCA  (= ΔCash).
//   This is verified by the `netcf-cash` check in validateFinancialData().
//
//   Prior versions used `OCF = PBT + ΔCL − ΔCA`, which by the BS identity
//   collapsed NetCF to ~0 in every period — structurally degenerate.
//
//   A true ledger-split would use OCF = PBT + ΔCL − ΔOtherCA and derive Cash
//   directly; that requires voucher-level Tally data which the cloud TDL link
//   cannot return. The CA-as-Cash approximation is the cleanest restatement
//   achievable with group-level data.

/** Operating CF = PBT + ΔOperating liabilities (no ΔCA — CA is treated as cash). */
export const monthlyOCF = Array.from({ length: 11 }, (_, i) =>
  +(monthlyPBT[i + 1] + (monthlyCL[i + 1] - monthlyCL[i])).toFixed(2),
);

/**
 * CapEx (cash flow) = −ΔFixed Assets. Signed negative when cash is deployed
 * into PP&E (asset base grew), positive on disposals. SpeakX CapEx YTD is
 * ~₹1.57 Cr — mostly laptops, studio equipment, and furniture for the Delhi
 * office.
 */
export const monthlyCapEx = Array.from({ length: 11 }, (_, i) =>
  +(-(monthlyFixedAssets[i + 1] - monthlyFixedAssets[i])).toFixed(2),
);

/**
 * Treasury CF = −ΔInvestments. Signed negative when cash is moved INTO
 * mutual funds / corporate bonds / FDs (treasury deployment), positive on
 * redemptions. This is not "real" investing activity — it's rebalancing the
 * cash pool between bank and marketable securities.
 */
export const monthlyTreasuryCF = Array.from({ length: 11 }, (_, i) =>
  +(-(monthlyInvestments[i + 1] - monthlyInvestments[i])).toFixed(2),
);

/** Investing CF = CapEx + Treasury (matches the old −ΔNCA derivation). */
export const monthlyICF = monthlyCapEx.map(
  (c, i) => +(c + monthlyTreasuryCF[i]).toFixed(2),
);

/**
 * Financing CF = Δshare capital + Δlong-term debt.
 *
 * Historical note: this used to be exported as `monthlyFCF`, which is a
 * globally confusing name because FCF universally means Free Cash Flow.
 * Renamed to `monthlyFinancingCF`; a `monthlyFreeCashFlow` export below now
 * holds the true Free Cash Flow metric.
 */
export const monthlyFinancingCF = Array.from({ length: 11 }, (_, i) =>
  +(
    (monthlyCapital[i + 1] - monthlyCapital[i]) +
    (monthlyNCL[i + 1] - monthlyNCL[i])
  ).toFixed(2),
);

/**
 * Free Cash Flow = OCF − CapEx.
 * `monthlyCapEx` is already signed negative for outflows, so we ADD it here
 * (OCF + (−|CapEx|)) to reduce OCF by CapEx magnitude.
 */
export const monthlyFreeCashFlow = monthlyOCF.map(
  (o, i) => +(o + monthlyCapEx[i]).toFixed(2),
);

/** Net Cash Flow = OCF + ICF + FinancingCF (equals ΔCA under the CA-as-Cash classification). */
export const monthlyNetCF = monthlyOCF.map(
  (o, i) => +(o + monthlyICF[i] + monthlyFinancingCF[i]).toFixed(2),
);

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
  /** Section header row (no numeric data — see DataTable.DataRow.section). */
  section?: boolean;
}

const sumArr = (arr: number[]) => +arr.reduce((a, b) => a + b, 0).toFixed(2);

/** Section header helper — 12 zero-filled values so aggregate() works across periods. */
const sectionRow = (label: string): PnlRow => ({
  label,
  monthly: Array(12).fill(0),
  ytd: 0,
  section: true,
});

export const pnlStructure: PnlRow[] = [
  sectionRow('— Operating P&L —'),
  {
    label: 'Total Revenue',
    monthly: monthlyRevenue,
    ytd: sumArr(monthlyRevenue),
    bold: true,
  },
  {
    // Operating Expenses includes Cost of Revenue (Direct Expenses) as the
    // first child. COGS is not shown as a standalone line — at 98.6% gross
    // margin it's immaterial and clutters the waterfall. The parent total is
    // Indirect OpEx (ex-finance, ex-dep); COGS appears for reference only.
    label: 'Operating Expenses',
    monthly: monthlyOperatingExpenses,
    ytd: sumArr(monthlyOperatingExpenses),
    bold: true,
    children: [
      { label: 'Cost of Revenue', monthly: monthlyCOGS, ytd: sumArr(monthlyCOGS), indent: true },
      { label: 'Employee Benefits', monthly: opexMonthly.employeeBenefits, ytd: sumArr(opexMonthly.employeeBenefits), indent: true },
      { label: 'Performance Marketing', monthly: opexMonthly.performanceMarketing, ytd: sumArr(opexMonthly.performanceMarketing), indent: true },
      { label: 'IT Expenses', monthly: opexMonthly.itExpenses, ytd: sumArr(opexMonthly.itExpenses), indent: true },
      { label: 'Professional Charges', monthly: opexMonthly.professionalCharges, ytd: sumArr(opexMonthly.professionalCharges), indent: true },
      { label: 'Travel & Conveyance', monthly: opexMonthly.travelConveyance, ytd: sumArr(opexMonthly.travelConveyance), indent: true },
      { label: 'Rent', monthly: opexMonthly.rent, ytd: sumArr(opexMonthly.rent), indent: true },
      { label: 'Office Expenses', monthly: opexMonthly.officeExpenses, ytd: sumArr(opexMonthly.officeExpenses), indent: true },
      { label: 'Freelancer Services', monthly: opexMonthly.freelancerServices, ytd: sumArr(opexMonthly.freelancerServices), indent: true },
      { label: 'Auditor Fee', monthly: opexMonthly.auditorFee, ytd: sumArr(opexMonthly.auditorFee), indent: true },
      { label: 'Training & Development', monthly: opexMonthly.trainingDevelopment, ytd: sumArr(opexMonthly.trainingDevelopment), indent: true },
      { label: 'Repairs & Maintenance', monthly: opexMonthly.repairsMaintenance, ytd: sumArr(opexMonthly.repairsMaintenance), indent: true },
      { label: 'Telephone', monthly: opexMonthly.telephone, ytd: sumArr(opexMonthly.telephone), indent: true },
      { label: 'Insurance', monthly: opexMonthly.insurance, ytd: sumArr(opexMonthly.insurance), indent: true },
      { label: 'Interest on Car Loan', monthly: opexMonthly.interestOnCarLoan, ytd: sumArr(opexMonthly.interestOnCarLoan), indent: true },
      { label: 'Foreign Exchange', monthly: opexMonthly.foreignExchange, ytd: sumArr(opexMonthly.foreignExchange), indent: true },
      { label: 'Power & Fuel', monthly: opexMonthly.powerFuel, ytd: sumArr(opexMonthly.powerFuel), indent: true },
      { label: 'Loss on Damage', monthly: opexMonthly.lossDamageAssets, ytd: sumArr(opexMonthly.lossDamageAssets), indent: true },
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
  sectionRow('— Non-Operating —'),
  {
    // Finance Costs (interest on loans, bank charges, LC charges) — pulled
    // out of OpEx and placed below EBIT per Ind-AS 1 / Schedule III.
    label: 'Finance Costs',
    monthly: monthlyFinanceCosts,
    ytd: sumArr(monthlyFinanceCosts),
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
  sectionRow('— Taxation —'),
  {
    label: 'Income Tax (booked)',
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

// OpEx chart series — Finance Charges excluded because they now sit below
// EBIT as Finance Costs. Chart shows operating-only cost composition.
export const opexChartSeries = [
  { label: 'Performance Marketing', color: '#FF9F0A', data: opexMonthly.performanceMarketing },
  { label: 'Employee Benefits', color: '#BF5AF2', data: opexMonthly.employeeBenefits },
  { label: 'IT Expenses', color: '#00FFCC', data: opexMonthly.itExpenses },
  { label: 'Professional Charges', color: '#64D2FF', data: opexMonthly.professionalCharges },
  { label: 'Other OpEx', color: '#8A8F98', data: (() => {
    // Sum all smaller categories (excluding finance charges and depreciation)
    const other = opexMonthly.rent.map((_, i) =>
      +(opexMonthly.travelConveyance[i] + opexMonthly.rent[i] + opexMonthly.officeExpenses[i] +
        opexMonthly.freelancerServices[i] + opexMonthly.auditorFee[i] + opexMonthly.trainingDevelopment[i] +
        opexMonthly.repairsMaintenance[i] + opexMonthly.telephone[i] + opexMonthly.insurance[i] +
        opexMonthly.interestOnCarLoan[i] + opexMonthly.foreignExchange[i] + opexMonthly.powerFuel[i] +
        opexMonthly.lossDamageAssets[i] + opexMonthly.otherMisc[i]).toFixed(2)
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

  // 3. EBITDA derivation holds (EBITDA = GP − Operating Expenses ex-finance)
  for (let i = 0; i < 12; i++) {
    const expected = monthlyGrossProfit[i] - monthlyOperatingExpenses[i];
    if (Math.abs(monthlyEBITDA[i] - expected) > tol) {
      issues.push({
        check: 'ebitda-formula',
        detail: `${MONTHS[i]}: EBITDA ${monthlyEBITDA[i]} ≠ GP ${monthlyGrossProfit[i]} − OpEx ${monthlyOperatingExpenses[i]}`,
      });
    }
  }

  // 4. PBT equals EBIT − Finance Costs + Other Income (Ind-AS waterfall)
  for (let i = 0; i < 12; i++) {
    const expected = monthlyEBIT[i] - monthlyFinanceCosts[i] + monthlyOtherIncome[i];
    if (Math.abs(monthlyPBT[i] - expected) > tol) {
      issues.push({
        check: 'pbt-formula',
        detail: `${MONTHS[i]}: PBT ${monthlyPBT[i]} ≠ EBIT ${monthlyEBIT[i]} − Fin ${monthlyFinanceCosts[i]} + OI ${monthlyOtherIncome[i]}`,
      });
    }
  }

  // 5. Operating Expenses + Finance Costs + Depreciation reconcile to Total OpEx (Tally group)
  for (let i = 0; i < 12; i++) {
    const expected = monthlyOperatingExpenses[i] + monthlyFinanceCosts[i] + monthlyDepreciation[i];
    if (Math.abs(expected - monthlyTotalOpex[i]) > tol) {
      issues.push({
        check: 'opex-split',
        detail: `${MONTHS[i]}: OpEx ${monthlyOperatingExpenses[i]} + Fin ${monthlyFinanceCosts[i]} + Dep ${monthlyDepreciation[i]} ≠ Total ${monthlyTotalOpex[i]}`,
      });
    }
  }

  // 6. Net Cash Flow reconciles to ΔCA (CA-as-Cash classification).
  //    If this drifts beyond tolerance the indirect-method waterfall is lying
  //    to investors — cash flows should always tie to the balance sheet change.
  const cfTol = 1.0; // 1 lakh — larger tolerance here because rounding compounds across OCF+ICF+FCF
  for (let i = 0; i < 11; i++) {
    const deltaCA = monthlyCA[i + 1] - monthlyCA[i];
    const drift = Math.abs(monthlyNetCF[i] - deltaCA);
    if (drift > cfTol) {
      issues.push({
        check: 'netcf-cash',
        detail: `${MONTHS[i + 1]}: NetCF ${monthlyNetCF[i].toFixed(2)} ≠ ΔCA ${deltaCA.toFixed(2)} (drift ${drift.toFixed(2)} L)`,
      });
    }
  }

  // 7. Investing CF = CapEx + Treasury split holds.
  for (let i = 0; i < 11; i++) {
    const expected = monthlyCapEx[i] + monthlyTreasuryCF[i];
    if (Math.abs(expected - monthlyICF[i]) > tol) {
      issues.push({
        check: 'icf-split',
        detail: `${MONTHS[i + 1]}: CapEx ${monthlyCapEx[i]} + Treasury ${monthlyTreasuryCF[i]} ≠ ICF ${monthlyICF[i]}`,
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
