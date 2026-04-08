import SectionHeader from '../sections/SectionHeader';
import TrendsSection from '../sections/TrendsSection';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function TrendsPage() {
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
      <SectionHeader title="P&L TRENDS" />
      <TrendsSection />
    </div>
  );
}
