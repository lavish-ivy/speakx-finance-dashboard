import SectionHeader from '../sections/SectionHeader';
import WaterfallSection from '../sections/WaterfallSection';
import PageShell from './PageShell';

export default function PnlPage() {
  return (
    <PageShell>
      <SectionHeader title="P&L PERFORMANCE" />
      <WaterfallSection />
    </PageShell>
  );
}
