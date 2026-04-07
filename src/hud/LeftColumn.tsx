import FinancialKPIs from './panels/FinancialKPIs';
import OperatingExpenses from './panels/OperatingExpenses';
import { useBreakpoint } from '../hooks/useBreakpoint';

const LeftColumn = () => {
  const { isDesktop } = useBreakpoint();
  const isCompact = !isDesktop;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: isCompact ? '10px' : '12px',
      width: isDesktop ? '40%' : '100%',
      height: isDesktop ? '100%' : undefined,
      minWidth: 0,
    }}>
      <div
        className="fade-in-left"
        style={{
          flex: isDesktop ? '55 1 0%' : undefined,
          minHeight: isCompact ? 320 : 0,
          animationDelay: '0.3s',
        }}
      >
        <FinancialKPIs />
      </div>
      <div
        className="fade-in-left"
        style={{
          flex: isDesktop ? '45 1 0%' : undefined,
          minHeight: isCompact ? 280 : 0,
          animationDelay: '0.4s',
        }}
      >
        <OperatingExpenses />
      </div>
    </div>
  );
};

export default LeftColumn;
