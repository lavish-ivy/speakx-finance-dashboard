import SectionHeader from '../sections/SectionHeader';
import CashLiquiditySection from '../sections/CashLiquiditySection';
import PageShell from './PageShell';

export default function CashPage() {
  return (
    <PageShell>
      <SectionHeader title="CASH & LIQUIDITY" />
      <CashLiquiditySection />
    </PageShell>
  );
}
