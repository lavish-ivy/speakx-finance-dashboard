import { Routes, Route } from 'react-router-dom';
import PnlPage from './pages/PnlPage';
import BalanceSheetPage from './pages/BalanceSheetPage';
import CashPage from './pages/CashPage';
import TrendsPage from './pages/TrendsPage';
import DashboardNav from './nav/DashboardNav';
import '@fontsource/orbitron/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

function App() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative', overflowX: 'hidden' }}>
      <Routes>
        <Route path="/" element={<PnlPage />} />
        <Route path="/balance-sheet" element={<BalanceSheetPage />} />
        <Route path="/cash" element={<CashPage />} />
        <Route path="/trends" element={<TrendsPage />} />
      </Routes>
      <DashboardNav />
    </div>
  );
}

export default App;
