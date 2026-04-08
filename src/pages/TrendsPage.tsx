import SectionHeader from '../sections/SectionHeader';
import TrendsSection from '../sections/TrendsSection';
import PageShell from './PageShell';

export default function TrendsPage() {
  return (
    <PageShell>
      <SectionHeader title="P&L TRENDS" />
      <TrendsSection />
    </PageShell>
  );
}
