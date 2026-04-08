import SectionHeader from '../sections/SectionHeader';
import CashLiquiditySection from '../sections/CashLiquiditySection';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function CashPage() {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{
      maxWidth: 1440,
      margin: '0 auto',
      padding: isMobile ? 16 : 24,
      paddingTop: isMobile ? 16 : 32,
      paddingBottom: 80,
      minHeight: '100vh',
      boxSizing: 'border-box',
    }}>
      <SectionHeader title="CASH & LIQUIDITY" />
      <CashLiquiditySection />
    </div>
  );
}
