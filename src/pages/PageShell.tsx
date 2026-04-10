import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function PageShell({ children }: { children: ReactNode }) {
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const els = [document.documentElement, document.body, document.getElementById('root')].filter(Boolean) as HTMLElement[];
    els.forEach(el => el.classList.add('scrollable'));
    return () => { els.forEach(el => el.classList.remove('scrollable')); };
  }, []);

  if (isMobile) {
    return (
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: 16,
        paddingBottom: 70,
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 1440,
      margin: '0 auto',
      padding: '16px 16px 52px',
      height: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}
