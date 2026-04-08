import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Scene from './canvas/Scene';
import HUD from './hud/HUD';
import ExtendedDashboard from './sections/ExtendedDashboard';
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
      {isMobile ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'var(--bg-deep)' }} />
      ) : (
        <Canvas
          style={{ position: 'fixed', inset: 0, zIndex: 0 }}
          gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      )}
      <HUD />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <ExtendedDashboard />
      </div>
    </>
  );
}

function App() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative', overflowX: 'hidden' }}>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/v2" element={<V2ClassicDashboard />} />
      </Routes>
      <DashboardNav />
    </div>
  );
}

export default App;
