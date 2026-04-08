import FinancialAnalysis from './panels/FinancialAnalysis';
import MarginTrends from './panels/MarginTrends';
import CashFlowAnalysis from './panels/CashFlowAnalysis';
import { useBreakpoint } from '../hooks/useBreakpoint';

const RightColumn = () => {
  const { isMobile, isDesktop } = useBreakpoint();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '12px' : '12px',
      width: isDesktop ? '60%' : '100%',
      height: isDesktop ? '100%' : undefined,
      minWidth: 0,
    }}>
      <div
        className="fade-in-right"
        style={{
          flex: isDesktop ? '38 1 0%' : undefined,
          minHeight: 0,
          animationDelay: '0.5s',
        }}
      >
        <FinancialAnalysis />
      </div>
      <div
        className="fade-in-right"
        style={{
          flex: isDesktop ? '32 1 0%' : undefined,
          minHeight: 0,
          animationDelay: '0.6s',
        }}
      >
        <MarginTrends />
      </div>
      <div
        className="fade-in-up"
        style={{
          flex: isDesktop ? '30 1 0%' : undefined,
          minHeight: 0,
          animationDelay: '0.7s',
        }}
      >
        <CashFlowAnalysis />
      </div>
    </div>
  );
};

export default RightColumn;
