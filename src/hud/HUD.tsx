import { useEffect } from 'react';
import Header from './Header';
import HeroStatement from './panels/HeroStatement';
import FinancialAnalysis from './panels/FinancialAnalysis';
import MarginTrends from './panels/MarginTrends';
import OperatingExpenses from './panels/OperatingExpenses';
import CashFlowAnalysis from './panels/CashFlowAnalysis';
import { useBreakpoint } from '../hooks/useBreakpoint';

/**
 * Editorial CFO layout — "The Annual Review" front page.
 *
 * This is not a dashboard. The structure is deliberately magazine-style:
 *
 *   ┌────────────────────────────────────────────────────────┐
 *   │ Masthead — SpeakX · The Annual Review                  │
 *   ╞════════════════════════════════════════════════════════╡
 *   │ Hero statement                                         │
 *   │  - serif italic standfirst (one-sentence take-home)    │
 *   │  - 4 display figures: Revenue · PBT · FCF · Liquidity  │
 *   │  - PBT→PAT bridge + methodology caveats                │
 *   ├────────────────────────────────────────────────────────┤
 *   │ Revenue vs Expenses — hero chart (full width)          │
 *   ├──────────────────┬──────────────────┬──────────────────┤
 *   │ Cash flow        │ Income comp      │ Operating exp    │
 *   └──────────────────┴──────────────────┴──────────────────┘
 *
 * The IA reads top-to-bottom: narrative anchor → chart that proves it →
 * supporting decomposition. A board member can stop reading after the hero
 * and still walk away with the 30-second take-home, which is the actual
 * test of whether this works as a CFO artefact.
 *
 * FinancialKPIs has been deleted from the Overview. Its content was folded
 * into HeroStatement — the standfirst carries the narrative, the 4 display
 * figures carry the numbers, and the bridge row carries the reconciliation.
 * Keeping it as a standalone panel on top of the hero would have been pure
 * duplication.
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
        <HeroStatement />
        <hr className="rule rule--thick" />
        <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <MarginTrends />
        </div>
        <hr className="rule" />
        <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CashFlowAnalysis />
        </div>
        <hr className="rule" />
        <div className="fade-in-up" style={{ animationDelay: '0.5s' }}>
          <FinancialAnalysis />
        </div>
        <hr className="rule" />
        <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
          <OperatingExpenses />
        </div>
      </div>
    );
  }

  // Desktop / tablet — editorial stack: hero → hero chart → supporting strip.
  // Heights flow from an explicit flex column so the chart and supporting row
  // adapt to viewport while the hero keeps its natural (content-sized) height.
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: pageGutter,
        paddingTop: 24,
        paddingBottom: 60,
        boxSizing: 'border-box',
        background: 'var(--bg-deep)',
        gap: 24,
      }}
    >
      <Header />

      {/* Hero statement — natural height */}
      <HeroStatement />

      {/* Thick editorial rule separating hero from the body */}
      <hr
        className="rule rule--thick"
        style={{ margin: '4px 0 0 0' }}
      />

      {/* Hero chart — Revenue vs Expenses, full width */}
      <div
        className="fade-in-up"
        style={{
          animationDelay: '0.3s',
          minHeight: 280,
          overflow: 'hidden',
        }}
      >
        <MarginTrends />
      </div>

      {/* Hairline divider */}
      <hr className="rule" style={{ margin: 0 }} />

      {/* Supporting 3-column strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          columnGap: 32,
          minHeight: 240,
        }}
      >
        <div
          className="fade-in-up"
          style={{
            animationDelay: '0.4s',
            minHeight: 0,
            overflow: 'hidden',
            borderRight: '1px solid var(--border-card)',
            paddingRight: 32,
          }}
        >
          <CashFlowAnalysis />
        </div>
        <div
          className="fade-in-up"
          style={{
            animationDelay: '0.5s',
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
            animationDelay: '0.6s',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <OperatingExpenses />
        </div>
      </div>
    </div>
  );
};

export default HUD;
