import { useEffect } from 'react';
import Header from './Header';
import LeftColumn from './LeftColumn';
import RightColumn from './RightColumn';
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
  const gap = isMobile ? '12px' : isTablet ? '12px' : '16px';

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
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap,
        flex: isMobile ? undefined : 1,
        marginTop: isMobile ? '8px' : '12px',
        minHeight: isMobile ? undefined : 0,
      }}>
        <LeftColumn />
        <RightColumn />
      </div>
    </div>
  );
};

export default HUD;
