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

  return (
    <div style={{
      maxWidth: 1440,
      margin: '0 auto',
      padding: isMobile ? 16 : 24,
      paddingTop: isMobile ? 16 : 32,
      paddingBottom: 80,
      minHeight: '100vh',
      boxSizing: 'border-box',
    }}>
      {children}
    </div>
  );
}
