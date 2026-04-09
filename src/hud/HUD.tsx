import { useEffect } from 'react';
import Header from './Header';
import FinancialKPIs from './panels/FinancialKPIs';
import FinancialAnalysis from './panels/FinancialAnalysis';
import MarginTrends from './panels/MarginTrends';
import OperatingExpenses from './panels/OperatingExpenses';
import CashFlowAnalysis from './panels/CashFlowAnalysis';
import { useBreakpoint } from '../hooks/useBreakpoint';

const HUD = () => {
  const { isMobile, isTablet } = useBreakpoint();

  useEffect(() => {
    const els = [document.documentElement, document.body, document.getElementById('root')].filter(Boolean) as HTMLElement[];
    els.forEach(el => el.classList.add('scrollable'));
    return () => {
      els.forEach(el => el.classList.remove('scrollable'));
    };
  }, []);

  const padding = isMobile ? '12px' : isTablet ? '14px' : '16px';

  if (isMobile) {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        zIndex: 10,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding,
        paddingBottom: '70px',
        boxSizing: 'border-box',
      }}>
        <Header />
        <div className="fade-in" style={{ animationDelay: '0.2s' }}><FinancialKPIs /></div>
        <div className="fade-in-up" style={{ animationDelay: '0.3s' }}><FinancialAnalysis /></div>
        <div className="fade-in-up" style={{ animationDelay: '0.4s' }}><MarginTrends /></div>
        <div className="fade-in-up" style={{ animationDelay: '0.5s' }}><OperatingExpenses /></div>
        <div className="fade-in-up" style={{ animationDelay: '0.6s' }}><CashFlowAnalysis /></div>
      </div>
    );
  }

  // Desktop/tablet: fit everything in one viewport
  // Header ~48px, nav bar ~48px, padding 16*2=32px, gaps 10*3=30px → ~158px overhead
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      zIndex: 10,
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      padding,
      paddingBottom: '56px', // nav bar
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0 }}>
        <Header />
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 3fr',
        gridTemplateRows: '1fr 1.4fr 1fr',
        gap: 10,
        marginTop: 10,
        flex: 1,
        minHeight: 0,
      }}>
        {/* Row 1 left: KPIs */}
        <div className="fade-in-left" style={{ animationDelay: '0.2s', minHeight: 0, overflow: 'hidden' }}>
          <FinancialKPIs />
        </div>
        {/* Row 1 right: P&L Overview */}
        <div className="fade-in-right" style={{ animationDelay: '0.3s', minHeight: 0, overflow: 'hidden' }}>
          <FinancialAnalysis />
        </div>
        {/* Row 2: Revenue vs Expenses (full width) */}
        <div className="fade-in-up" style={{ gridColumn: '1 / -1', animationDelay: '0.4s', minHeight: 0, overflow: 'hidden' }}>
          <MarginTrends />
        </div>
        {/* Row 3 left: Expenses */}
        <div className="fade-in-left" style={{ animationDelay: '0.5s', minHeight: 0, overflow: 'hidden' }}>
          <OperatingExpenses />
        </div>
        {/* Row 3 right: Cash Flow */}
        <div className="fade-in-right" style={{ animationDelay: '0.6s', minHeight: 0, overflow: 'hidden' }}>
          <CashFlowAnalysis />
        </div>
      </div>
    </div>
  );
};

export default HUD;
