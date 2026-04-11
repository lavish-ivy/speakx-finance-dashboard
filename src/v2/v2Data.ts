/**
 * V2 data adapter — maps our real Tally data to the V2 component format.
 */
import {
  financialKPIs,
  waterfallData as rawWaterfall,
  profitabilityData as rawProfitability,
  balanceSheetData as rawBS,
  assetComposition as rawAssets,
  cashLiquidityData as rawCash,
  cashPositionChart as rawCashChart,
  historicalTrendsData as rawTrends,
  debtEquity as rawDE,
} from '../data/mockData';

// ── KPI Strip ──
export const kpiData = [
  { id: 'ytd-revenue',  label: 'YTD REVENUE',    value: financialKPIs.revenue.value,       unit: 'Cr', prefix: '₹', delta: null, deltaLabel: null },
  { id: 'total-income', label: 'TOTAL INCOME',   value: financialKPIs.totalIncome.value,   unit: 'Cr', prefix: '₹', delta: null, deltaLabel: null },
  { id: 'total-exp',    label: 'TOTAL EXPENSES', value: financialKPIs.totalExpenses.value, unit: 'Cr', prefix: '₹', delta: null, deltaLabel: null },
  { id: 'pbt',          label: 'PBT (BOOKED)',   value: financialKPIs.pbt.value,           unit: 'Cr', prefix: '₹', delta: null, deltaLabel: null, highlight: true },
];

// ── Waterfall ──
export const waterfallData = rawWaterfall;

// ── Profitability ──
export const profitabilityData = rawProfitability;

// ── Balance Sheet Table (flatten for V2 table format) ──
export const balanceSheetTableData = [
  ...rawBS.equityAndLiabilities.map(r => ({
    metric: r.metric,
    current: `₹${r.value.toFixed(2)} Cr`,
    projected: '—',
    bold: r.bold,
  })),
  { metric: '', current: '', projected: '', bold: false },
  ...rawBS.assets.map(r => ({
    metric: r.metric,
    current: `₹${r.value.toFixed(2)} Cr`,
    projected: '—',
    bold: r.bold,
  })),
];

// ── Asset Donut ──
export const assetComposition = rawAssets;

// ── Cash Table (flatten) ──
export const cashLiquidityTableData = rawCash.map(r => ({
  metric: r.metric,
  current: `₹${r.value.toFixed(2)} Cr`,
  projected: '—',
  bold: r.bold,
  sub: r.sub,
}));

// ── Cash Position Chart ──
export const cashPositionChart = {
  xLabels: rawCashChart.months,
  historic: rawCashChart.totalLiquidity,
  projection: rawCashChart.totalLiquidity.map((_, i) => i >= 9 ? rawCashChart.totalLiquidity[i] : null),
};

// ── Compliance ──
export const complianceData = { value: 46, max: 100 };

// ── Variance Radar ──
export const varianceRadarData = {
  axes: ['Tax', 'Rev Var', 'Op Exp Var', 'Employee', 'Marketing'],
  values: [70, 50, 60, 40, 80],
};

// ── Historical Trends ──
export const historicalTrendsData = rawTrends;

// ── Debt/Equity ──
export const debtEquity = rawDE;
