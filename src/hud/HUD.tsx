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

  const padding = isMobile ? '16px 16px' : isTablet ? '16px' : '20px';

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
        gap: 12,
        padding,
        paddingBottom: '80px',
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

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      zIndex: 10,
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      padding,
      paddingBottom: '80px',
      boxSizing: 'border-box',
    }}>
      <Header />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gridTemplateRows: 'auto auto auto',
        gap: 12,
        marginTop: 12,
        flex: 1,
      }}>
        {/* Row 1 left: KPIs */}
        <div className="fade-in-left" style={{ animationDelay: '0.2s' }}>
          <FinancialKPIs />
        </div>
        {/* Row 1 right: P&L Overview */}
        <div className="fade-in-right" style={{ animationDelay: '0.3s' }}>
          <FinancialAnalysis />
        </div>
        {/* Row 2: Revenue vs Expenses (spans full width) */}
        <div className="fade-in-up" style={{ gridColumn: '1 / -1', animationDelay: '0.4s' }}>
          <MarginTrends />
        </div>
        {/* Row 3 left: Expenses */}
        <div className="fade-in-left" style={{ animationDelay: '0.5s' }}>
          <OperatingExpenses />
        </div>
        {/* Row 3 right: Cash Flow */}
        <div className="fade-in-right" style={{ animationDelay: '0.6s' }}>
          <CashFlowAnalysis />
        </div>
      </div>
    </div>
  );
};

export default HUD;
