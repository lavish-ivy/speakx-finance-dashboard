export function formatCurrency(value: number, unit: string, currency: string = '₹'): string {
  if (unit === 'Cr') return `${currency}${value.toFixed(2)} Cr`;
  if (unit === 'L')  return `${currency}${value.toFixed(2)} L`;
  if (unit === 'B')  return `${currency}${value.toFixed(1)}B`;
  if (unit === 'M')  return `${currency}${Math.round(value)}M`;
  return `${currency}${value}`;
}

export function formatPercent(value: number): string {
  return `${value % 1 === 0 ? value : value.toFixed(1)}%`;
}
