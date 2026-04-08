import SectionHeader from '../sections/SectionHeader';
import BalanceSheetSection from '../sections/BalanceSheetSection';
import PageShell from './PageShell';

export default function BalanceSheetPage() {
  return (
    <PageShell>
      <SectionHeader title="BALANCE SHEET & ASSETS" />
      <BalanceSheetSection />
    </PageShell>
  );
}
