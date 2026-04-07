import { useEffect } from 'react';
import Header from './Header';
import LeftColumn from './LeftColumn';
import RightColumn from './RightColumn';
import { useBreakpoint } from '../hooks/useBreakpoint';

const HUD = () => {
  const { isMobile, isTablet } = useBreakpoint();

  useEffect(() => {
    const els = [document.documentElement, document.body, document.getElementById('root')].filter(Boolean) as HTMLElement[];
    if (isMobile) {
      els.forEach(el => el.classList.add('scrollable'));
    } else {
      els.forEach(el => el.classList.remove('scrollable'));
    }
    return () => {
      els.forEach(el => el.classList.remove('scrollable'));
    };
  }, [isMobile]);

  const padding = isMobile ? '12px' : isTablet ? '16px' : '20px';
  const gap = isMobile ? '10px' : isTablet ? '12px' : '16px';

  return (
    <div style={{
      position: isMobile ? 'relative' : 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: isMobile ? 'auto' : '100vh',
      minHeight: isMobile ? '100vh' : undefined,
      zIndex: 10,
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      padding,
      boxSizing: 'border-box',
      overflow: isMobile ? 'visible' : 'hidden',
    }}>
      <Header />
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap,
        flex: isMobile ? undefined : 1,
        marginTop: '12px',
        minHeight: isMobile ? undefined : 0,
      }}>
        <LeftColumn />
        <RightColumn />
      </div>
    </div>
  );
};

export default HUD;
