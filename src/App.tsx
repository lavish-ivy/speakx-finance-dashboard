import { Routes, Route } from 'react-router-dom';
import OverviewPage from './pages/OverviewPage';
import PnlPage from './pages/PnlPage';
import BalanceSheetPage from './pages/BalanceSheetPage';
import CashPage from './pages/CashPage';
import DashboardNav from './nav/DashboardNav';
import { DashboardProvider } from './context/DashboardContext';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

/**
 * Editorial CFO shell.
 *
 * The previous version layered a GridFloor, AmbientParticles, and a radial
 * neon glow on top of the viewport — all gamer-HUD chrome that fought the
 * editorial direction. Stripped. The page is now a clean warm cream (light)
 * or warm near-black (dark) surface, and every panel sits on it with hairline
 * rules instead of glass cards.
 *
 * Fraunces (display serif) is loaded via Google Fonts in `index.css`.
 * Inter (body + data sans) is loaded via @fontsource here.
 */
function App() {
  return (
    <DashboardProvider>
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          background: 'var(--bg-deep)',
          position: 'relative',
          overflowX: 'hidden',
        }}
      >
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/pnl" element={<PnlPage />} />
          <Route path="/balance-sheet" element={<BalanceSheetPage />} />
          <Route path="/cash" element={<CashPage />} />
        </Routes>
        <DashboardNav />
      </div>
    </DashboardProvider>
  );
}

export default App;
