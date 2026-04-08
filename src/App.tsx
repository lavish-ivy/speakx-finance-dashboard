import { Routes, Route } from 'react-router-dom';
import OverviewPage from './pages/OverviewPage';
import PnlPage from './pages/PnlPage';
import BalanceSheetPage from './pages/BalanceSheetPage';
import CashPage from './pages/CashPage';
import TrendsPage from './pages/TrendsPage';
import DashboardNav from './nav/DashboardNav';
import GridFloor from './effects/GridFloor';
import AmbientParticles from './effects/AmbientParticles';
import '@fontsource/orbitron/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

function App() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative', overflowX: 'hidden' }}>
      <GridFloor />
      <AmbientParticles />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(0, 242, 255, 0.02), transparent)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/pnl" element={<PnlPage />} />
        <Route path="/balance-sheet" element={<BalanceSheetPage />} />
        <Route path="/cash" element={<CashPage />} />
        <Route path="/trends" element={<TrendsPage />} />
      </Routes>
      <DashboardNav />
    </div>
  );
}

export default App;
