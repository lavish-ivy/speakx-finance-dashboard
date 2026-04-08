import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Scene from './canvas/Scene';
import HUD from './hud/HUD';
import ExtendedDashboard from './sections/ExtendedDashboard';
import PnlPage from './pages/PnlPage';
import BalanceSheetPage from './pages/BalanceSheetPage';
import CashPage from './pages/CashPage';
import TrendsPage from './pages/TrendsPage';
import V2ClassicDashboard from './v2/V2ClassicDashboard';
import DashboardNav from './nav/DashboardNav';
import { useBreakpoint } from './hooks/useBreakpoint';
import '@fontsource/orbitron/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

function OverviewPage() {
  const { isMobile } = useBreakpoint();

  return (
    <>
      {/* 3D Background Layer - disabled on mobile for performance */}
      {isMobile ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            background: 'var(--bg-deep)',
          }}
        />
      ) : (
        <Canvas
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      )}

      {/* HUD Overlay — first viewport */}
      <HUD />

      {/* Extended sections — scroll below HUD */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <ExtendedDashboard />
      </div>
    </>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'relative',
      zIndex: 10,
      background: 'var(--bg-deep)',
      minHeight: '100vh',
    }}>
      {children}
    </div>
  );
}

function App() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'var(--bg-deep)',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/pnl" element={<PageShell><PnlPage /></PageShell>} />
        <Route path="/balance-sheet" element={<PageShell><BalanceSheetPage /></PageShell>} />
        <Route path="/cash" element={<PageShell><CashPage /></PageShell>} />
        <Route path="/trends" element={<PageShell><TrendsPage /></PageShell>} />
        <Route path="/v2" element={<V2ClassicDashboard />} />
      </Routes>
      <DashboardNav />
    </div>
  );
}

export default App;
