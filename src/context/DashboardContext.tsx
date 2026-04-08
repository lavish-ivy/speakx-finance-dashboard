import { createContext, useContext, useState, type ReactNode } from 'react';

export type Period = 'M' | 'Q' | 'A';

interface DashboardState {
  period: Period;
  setPeriod: (p: Period) => void;
  masked: boolean;
  setMasked: (m: boolean) => void;
}

const DashboardContext = createContext<DashboardState>({
  period: 'M',
  setPeriod: () => {},
  masked: false,
  setMasked: () => {},
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>('M');
  const [masked, setMasked] = useState(false);

  return (
    <DashboardContext.Provider value={{ period, setPeriod, masked, setMasked }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}

/** Display a value or blur it based on mask state */
export function useMaskedValue() {
  const { masked } = useDashboard();
  return (value: string) => masked ? '••••' : value;
}
