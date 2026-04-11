import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Header from '../Header';
import { FONTS } from '../../theme/typography';
import { useBreakpoint } from '../../hooks/useBreakpoint';

/**
 * Editorial page shell — the framed page every non-Overview page lives inside.
 *
 * This replaces the legacy `PageShell` + `SectionHeader` pair, which were
 * tuned for a fixed-viewport gamer-HUD (height: 100vh; overflow: hidden;
 * Orbitron wordmark with a pulsing underline). The editorial IA needs:
 *
 *   - A document scroll (not fixed viewport) because page-level narratives
 *     run longer than a laptop screen height once the hero statement, hero
 *     chart, supporting chart, and data table are stacked.
 *   - A consistent masthead at the top (the same Header the HUD uses).
 *   - A serif page title with a small-caps caption directly below, and a
 *     `rule--thick` underline that echoes the masthead rule.
 *   - Responsive gutters that scale with viewport width.
 *
 * Structure:
 *
 *     ┌ Header (masthead)  ─────────────────────────────┐
 *     │ ═══════════ thick rule ═════════════════════════ │
 *     │  Eyebrow — SMALL-CAPS ROUTE / RECONCILED TO …   │
 *     │  Serif title                                     │
 *     │  ── thick rule ──                                │
 *     │  [children — the page body]                      │
 *     └──────────────────────────────────────────────────┘
 *
 * Every page passes its own `title` (the serif headline) and `eyebrow`
 * (the small-caps caption that sits above it — route + unit + scope). The
 * children are the page's own IA (hero → hero chart → supporting → table).
 */
interface EditorialPageShellProps {
  title: string;
  eyebrow: string;
  children: ReactNode;
}

export default function EditorialPageShell({
  title,
  eyebrow,
  children,
}: EditorialPageShellProps) {
  const { isMobile, isTablet } = useBreakpoint();

  // Toggle document scroll — pages overflow the viewport once the editorial
  // stack is in place. This matches the behaviour `PageShell` set on mount.
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
  const paddingBottom = isMobile ? 90 : 72;

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
        paddingBottom,
        boxSizing: 'border-box',
        background: 'var(--bg-deep)',
        gap: isMobile ? 18 : 24,
      }}
    >
      <Header />

      {/* Eyebrow + serif page title — the editorial dateline for the section. */}
      <div
        className="fade-in-up"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          animationDelay: '0.15s',
        }}
      >
        <div
          style={{
            fontFamily: FONTS.caption.family,
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--text-muted)',
          }}
        >
          {eyebrow}
        </div>
        <h1
          style={{
            fontFamily: FONTS.serif.family,
            fontSize: isMobile ? 28 : isTablet ? 36 : 44,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      <hr className="rule rule--thick" style={{ margin: 0 }} />

      {children}
    </div>
  );
}
