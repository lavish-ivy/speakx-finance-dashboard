import { useEffect } from 'react';
import Header from './Header';
import FinancialKPIs from './panels/FinancialKPIs';
import FinancialAnalysis from './panels/FinancialAnalysis';
import MarginTrends from './panels/MarginTrends';
import OperatingExpenses from './panels/OperatingExpenses';
import CashFlowAnalysis from './panels/CashFlowAnalysis';
import { useBreakpoint } from '../hooks/useBreakpoint';

/**
 * Editorial CFO layout — "The Annual Review" front page.
 *
 * Replaces the 5-equal-glass-cards gamer-HUD grid with an editorial
 * hierarchy. Panels still own their own content; this file only owns the
 * page chrome — margins, hairline separators between columns, and the
 * ratio that implies "this chart matters more than this table".
 *
 * Desktop structure:
 *
 *   ┌────────────────────────────────────────────────┐
 *   │ Masthead                                       │
 *   ╞════════════════════════════════════════════════╡
 *   │ KPI strip      │ Income comp   │ OpEx breakdown │   ← row 1
 *   ├────────────────┴───────────────┬───────────────┤
 *   │ Revenue vs Expenses (hero)     │ Cash Flow     │   ← row 2
 *   └────────────────────────────────┴───────────────┘
 *
 * The hero ratio (row 1 is 2fr, row 2 is 3fr) gives the chart more vertical
 * real estate — it's the signature signal of the page. Hairline rules sit
 * between grid cells instead of glass-card backgrounds, so the eye moves
 * across content instead of bouncing off 5 floating tiles.
 */
const HUD = () => {
  const { isMobile, isTablet } = useBreakpoint();

  useEffect(() => {
    const els = [
      document.documentElement,
      document.body,
      document.getElementById('root'),
    ].filter(Boolean) as HTMLElement[];
    els.forEach((el) => el.classList.add('scrollable'));
    return () => {
      els.forEach((el) => el.classList.remove('scrollable'));
    };
  }, []);

  const pageGutter = isMobile ? '18px' : isTablet ? '28px' : '44px';

  if (isMobile) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          padding: pageGutter,
          paddingBottom: 80,
          boxSizing: 'border-box',
          background: 'var(--bg-deep)',
        }}
      >
        <Header />
        <div className="fade-in" style={{ animationDelay: '0.2s' }}>
          <FinancialKPIs />
        </div>
        <hr className="rule" />
        <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <MarginTrends />
        </div>
        <hr className="rule" />
        <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
          <FinancialAnalysis />
        </div>
        <hr className="rule" />
        <div className="fade-in-up" style={{ animationDelay: '0.5s' }}>
          <OperatingExpenses />
        </div>
        <hr className="rule" />
        <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
          <CashFlowAnalysis />
        </div>
      </div>
    );
  }

  // Desktop / tablet — hairline-separated editorial grid
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: pageGutter,
        paddingTop: 24,
        paddingBottom: 60,
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: 'var(--bg-deep)',
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <Header />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: '2fr 3fr',
          columnGap: 32,
          rowGap: 28,
          marginTop: 24,
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Row 1 */}
        <div
          className="fade-in-up"
          style={{
            animationDelay: '0.2s',
            minHeight: 0,
            overflow: 'hidden',
            borderRight: '1px solid var(--border-card)',
            paddingRight: 32,
          }}
        >
          <FinancialKPIs />
        </div>
        <div
          className="fade-in-up"
          style={{
            animationDelay: '0.3s',
            minHeight: 0,
            overflow: 'hidden',
            borderRight: '1px solid var(--border-card)',
            paddingRight: 32,
          }}
        >
          <FinancialAnalysis />
        </div>
        <div
          className="fade-in-up"
          style={{
            animationDelay: '0.4s',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <OperatingExpenses />
        </div>

        {/* Row 2 — hero chart 2-wide, cash flow 1-wide */}
        <div
          className="fade-in-up"
          style={{
            gridColumn: 'span 2',
            animationDelay: '0.5s',
            minHeight: 0,
            overflow: 'hidden',
            borderTop: '1px solid var(--border-card)',
            borderRight: '1px solid var(--border-card)',
            paddingTop: 20,
            paddingRight: 32,
          }}
        >
          <MarginTrends />
        </div>
        <div
          className="fade-in-up"
          style={{
            animationDelay: '0.6s',
            minHeight: 0,
            overflow: 'hidden',
            borderTop: '1px solid var(--border-card)',
            paddingTop: 20,
          }}
        >
          <CashFlowAnalysis />
        </div>
      </div>
    </div>
  );
};

export default HUD;
