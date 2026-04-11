import React from 'react';
import { FONTS, SIZES } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

/**
 * Editorial masthead — the front page of "The SpeakX Annual Review".
 *
 * Intentionally replaces the previous status-bar aesthetic (gradient logo
 * blob + pulsing LED dots + gamer-HUD wordmark). The new masthead idiom:
 *
 *    SPEAKX                              11 APR 2026 · LIVE FROM TALLY
 *    ─────────────────────────────────────────────────────────────────
 *    The Annual Review                              Fiscal Year 2025–26
 *    IVYPODS TECHNOLOGY PVT LTD
 *
 * Serif wordmark + caption tracking + thick rule — the vocabulary of a
 * real publication, not a dashboard.
 */

function formatToday(): string {
  const now = new Date();
  return now
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

const ThemeToggleButton: React.FC<{ isDark: boolean; toggle: () => void }> = ({ isDark, toggle }) => (
  <button
    onClick={toggle}
    aria-label="Toggle theme"
    style={{
      width: 22,
      height: 22,
      borderRadius: 0,
      background: 'transparent',
      border: '1px solid var(--border-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: 0,
      flexShrink: 0,
      transition: 'border-color 0.2s',
    }}
  >
    {isDark ? (
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="2.5" stroke="var(--text-primary)" strokeWidth="1" />
        <line x1="7" y1="1" x2="7" y2="2.5" stroke="var(--text-primary)" strokeWidth="1" strokeLinecap="round" />
        <line x1="7" y1="11.5" x2="7" y2="13" stroke="var(--text-primary)" strokeWidth="1" strokeLinecap="round" />
        <line x1="1" y1="7" x2="2.5" y2="7" stroke="var(--text-primary)" strokeWidth="1" strokeLinecap="round" />
        <line x1="11.5" y1="7" x2="13" y2="7" stroke="var(--text-primary)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path
          d="M10.5 8.5C9 10 6.5 10.5 4.5 9.5C2.5 8.5 1.5 6 2 3.5C0.5 5 0 7.5 1 9.5C2 11.5 4.5 12.5 7 12C9.5 11.5 11 9.5 10.5 8.5Z"
          stroke="var(--text-primary)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

const Header: React.FC = () => {
  const { isDark, toggle } = useTheme();
  const { isMobile } = useBreakpoint();

  const dateline = formatToday();

  return (
    <header
      className="fade-in-down"
      style={{
        width: '100%',
        padding: isMobile ? '14px 4px 10px' : '18px 4px 12px',
        borderBottom: '2px solid var(--text-primary)',
        animationDelay: '0.1s',
      }}
    >
      {/* Top line: wordmark + dateline */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
          marginBottom: isMobile ? 8 : 12,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.serif.family,
            fontSize: isMobile ? 20 : 28,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            fontFeatureSettings: '"ss01" 1',
          }}
        >
          SpeakX
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 8 : 14,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.caption.family,
              fontSize: isMobile ? 9 : SIZES.captionSmall,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {dateline}
            <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>·</span>
            Live from Tally
          </div>
          <ThemeToggleButton isDark={isDark} toggle={toggle} />
        </div>
      </div>

      {/* Bottom line: title + fiscal year */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONTS.serif.family,
              fontSize: isMobile ? 13 : 16,
              fontWeight: 400,
              fontStyle: 'italic',
              letterSpacing: '-0.005em',
              color: 'var(--text-secondary)',
              lineHeight: 1.1,
            }}
          >
            The Annual Review
          </div>
          <div
            style={{
              fontFamily: FONTS.caption.family,
              fontSize: isMobile ? 9 : 10,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            Ivypods Technology Pvt Ltd
          </div>
        </div>

        <div
          style={{
            fontFamily: FONTS.caption.family,
            fontSize: isMobile ? 9 : 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          Fiscal Year 2025–26
        </div>
      </div>
    </header>
  );
};

export default Header;
