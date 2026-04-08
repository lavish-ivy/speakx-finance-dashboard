import React from 'react';
import { FONTS, SIZES } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

const SpeakXLogo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #00FFCC, #BF5AF2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width={size / 2} height={size / 2} viewBox="0 0 16 16" fill="none">
      <path d="M8 1 L13 5.5 L8 8 L11 8 L8 15 L3 10.5 L8 8 L5 8 Z" fill="#FFFFFF" />
    </svg>
  </div>
);

const TitleBlock: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
    <span
      style={{
        fontFamily: FONTS.header.family,
        fontSize: isMobile ? 11 : SIZES.headerBar,
        fontWeight: FONTS.header.weight,
        textTransform: 'uppercase',
        letterSpacing: FONTS.header.letterSpacing,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {isMobile ? (
        <>SPEAKX <span style={{ color: 'var(--text-muted)' }}>|</span> FY 2025-26</>
      ) : (
        <>SPEAKX <span style={{ color: 'var(--text-muted)' }}>|</span> YEARLY PERFORMANCE REPORT{' '}
        <span style={{ color: 'var(--text-muted)' }}>|</span> FY 2025-26</>
      )}
    </span>
    {!isMobile && (
      <span
        style={{
          fontFamily: FONTS.body.family,
          fontSize: SIZES.subtext,
          fontWeight: FONTS.body.weight,
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        IVYPODS TECHNOLOGY PVT LTD — Live from Tally ERP
      </span>
    )}
  </div>
);

const StatusDots: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: isMobile ? 6 : 8,
          height: isMobile ? 6 : 8,
          borderRadius: '50%',
          background: 'var(--accent-cyan)',
          boxShadow: '0 0 6px var(--accent-cyan)',
          animation: 'pulseDot 2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </div>
);

const ThemeToggleButton: React.FC<{ isDark: boolean; toggle: () => void; isMobile: boolean }> = ({ isDark, toggle, isMobile }) => (
  <button
    onClick={toggle}
    aria-label="Toggle theme"
    style={{
      width: isMobile ? 24 : 28,
      height: isMobile ? 24 : 28,
      borderRadius: '50%',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      padding: 0,
      flexShrink: 0,
      transition: 'background 0.2s, border-color 0.2s',
    }}
  >
    {isDark ? (
      // Sun icon for dark mode (click to switch to light)
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="3" stroke="var(--accent-cyan)" strokeWidth="1.3" />
        <line x1="7" y1="0.5" x2="7" y2="2" stroke="var(--accent-cyan)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="7" y1="12" x2="7" y2="13.5" stroke="var(--accent-cyan)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="0.5" y1="7" x2="2" y2="7" stroke="var(--accent-cyan)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="12" y1="7" x2="13.5" y2="7" stroke="var(--accent-cyan)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="2.4" y1="2.4" x2="3.5" y2="3.5" stroke="var(--accent-cyan)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="10.5" y1="10.5" x2="11.6" y2="11.6" stroke="var(--accent-cyan)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="2.4" y1="11.6" x2="3.5" y2="10.5" stroke="var(--accent-cyan)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="10.5" y1="3.5" x2="11.6" y2="2.4" stroke="var(--accent-cyan)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ) : (
      // Moon icon for light mode (click to switch to dark)
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M10.5 8.5C9 10 6.5 10.5 4.5 9.5C2.5 8.5 1.5 6 2 3.5C0.5 5 0 7.5 1 9.5C2 11.5 4.5 12.5 7 12C9.5 11.5 11 9.5 10.5 8.5Z"
          stroke="var(--accent-cyan)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

const CalendarIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
    <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="var(--text-muted)" strokeWidth="1.2" />
    <line x1="1" y1="5.5" x2="13" y2="5.5" stroke="var(--text-muted)" strokeWidth="1.2" />
    <line x1="4" y1="1" x2="4" y2="3.5" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="10" y1="1" x2="10" y2="3.5" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const Header: React.FC = () => {
  const { isDark, toggle } = useTheme();
  const { isMobile } = useBreakpoint();

  const barStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-card)',
    padding: isMobile ? '0 16px' : '0 20px',
    boxSizing: 'border-box',
    borderRadius: '8px 8px 0 0',
  };

  return (
    <header className="fade-in-down" style={{ ...barStyle, animationDelay: '0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, minWidth: 0, flex: 1 }}>
        <SpeakXLogo size={isMobile ? 28 : 32} />
        <TitleBlock isMobile={isMobile} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 16, flexShrink: 0 }}>
        <StatusDots isMobile={isMobile} />
        <ThemeToggleButton isDark={isDark} toggle={toggle} isMobile={isMobile} />
        {/* Date removed — stale hardcoded dates are misleading */}
      </div>
    </header>
  );
};

export default Header;
