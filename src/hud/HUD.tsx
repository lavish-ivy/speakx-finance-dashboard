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

  // Desktop/tablet: 2-row layout that fits in one viewport
  // Row 1: KPIs + P&L Overview + Expenses (3 columns, compact)
  // Row 2: Revenue vs Expenses chart + Cash Flow (2 columns, taller)
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
      paddingBottom: '52px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0 }}>
        <Header />
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '2fr 3fr',
        gap: 10,
        marginTop: 10,
        flex: 1,
        minHeight: 0,
      }}>
        {/* Row 1: three compact panels */}
        <div className="fade-in-left" style={{ animationDelay: '0.2s', minHeight: 0, overflow: 'hidden' }}>
          <FinancialKPIs />
        </div>
        <div className="fade-in-up" style={{ animationDelay: '0.3s', minHeight: 0, overflow: 'hidden' }}>
          <FinancialAnalysis />
        </div>
        <div className="fade-in-right" style={{ animationDelay: '0.4s', minHeight: 0, overflow: 'hidden' }}>
          <OperatingExpenses />
        </div>

        {/* Row 2: chart takes 2 cols, cash flow takes 1 */}
        <div className="fade-in-up" style={{ gridColumn: 'span 2', animationDelay: '0.5s', minHeight: 0, overflow: 'hidden' }}>
          <MarginTrends />
        </div>
        <div className="fade-in-right" style={{ animationDelay: '0.6s', minHeight: 0, overflow: 'hidden' }}>
          <CashFlowAnalysis />
        </div>
      </div>
    </div>
  );
};

export default HUD;
