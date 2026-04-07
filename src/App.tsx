import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './canvas/Scene';
import HUD from './hud/HUD';
import { useBreakpoint } from './hooks/useBreakpoint';
import '@fontsource/orbitron/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

function App() {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      ...(isMobile ? {} : { height: '100vh', overflow: 'hidden' }),
      background: 'var(--bg-deep)',
      position: 'relative',
    }}>
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

      {/* HUD Overlay */}
      <HUD />
    </div>
  );
}

export default App;
