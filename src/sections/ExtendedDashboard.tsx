import SectionHeader from './SectionHeader';
import WaterfallSection from './WaterfallSection';
import BalanceSheetSection from './BalanceSheetSection';
import CashLiquiditySection from './CashLiquiditySection';
import TrendsSection from './TrendsSection';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function ExtendedDashboard() {
  const { isMobile } = useBreakpoint();
  const sectionGap = isMobile ? 16 : 24;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: isMobile ? 16 : 20, paddingTop: 0 }}>
      <section style={{ marginTop: sectionGap }}>
        <SectionHeader title="P&L PERFORMANCE" />
        <WaterfallSection />
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionHeader title="BALANCE SHEET & ASSETS" />
        <BalanceSheetSection />
      </section>

      <section style={{ marginTop: sectionGap }}>
        <SectionHeader title="CASH & LIQUIDITY" />
        <CashLiquiditySection />
      </section>

      <section style={{ marginTop: sectionGap, paddingBottom: 40 }}>
        <SectionHeader title="P&L TRENDS" />
        <TrendsSection />
      </section>
    </div>
  );
}
