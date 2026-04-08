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
