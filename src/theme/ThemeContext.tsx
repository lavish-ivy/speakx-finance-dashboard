import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { darkTokens, lightTokens, darkMap, lightMap } from './tokens';
import type { ThemeTokens } from './tokens';

type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  tokens: ThemeTokens;
  toggle: () => void;
  mapColor: (darkColor: string) => string;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  isDark: true,
  tokens: darkTokens,
  toggle: () => {},
  mapColor: (c) => c,
});

function injectCSSVariables(tokens: ThemeTokens) {
  const root = document.documentElement.style;
  root.setProperty('--bg-deep', tokens.bgDeep);
  root.setProperty('--bg-mid', tokens.bgMid);
  root.setProperty('--bg-card', tokens.bgCard);
  root.setProperty('--border-card', tokens.borderCard);
  root.setProperty('--border-subtle', tokens.borderSubtle);
  root.setProperty('--text-primary', tokens.textPrimary);
  root.setProperty('--text-secondary', tokens.textSecondary);
  root.setProperty('--text-muted', tokens.textMuted);
  root.setProperty('--accent-cyan', tokens.accentCyan);
  root.setProperty('--accent-gold', tokens.accentGold);
  root.setProperty('--accent-purple', tokens.accentPurple);
  root.setProperty('--accent-coral', tokens.accentCoral);
  root.setProperty('--accent-orange', tokens.accentOrange);
  root.setProperty('--accent-blue', tokens.accentBlue);
  root.setProperty('--glow-cyan', tokens.glowCyan);
  root.setProperty('--hover-glow', tokens.hoverGlow);
  root.setProperty('--hover-border', tokens.hoverBorder);
  root.setProperty('--chart-gridline', tokens.chartGridline);
  root.setProperty('--tooltip-bg', tokens.tooltipBg);
  root.setProperty('--divider', tokens.divider);
  root.setProperty('--selection-bg', tokens.selectionBg);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as ThemeMode) || 'dark';
    }
    return 'dark';
  });

  const isDark = mode === 'dark';
  const tokens = isDark ? darkTokens : lightTokens;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    injectCSSVariables(tokens);
  }, [mode, tokens]);

  const toggle = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  /**
   * Routes a legacy logical color key to its editorial hue for the active
   * mode. Panels author with slot literals (e.g. '#00FFCC' = "primary
   * positive"), and we remap to the forest/sage/burgundy/etc. palette here.
   * See `tokens.ts` for the slot meanings.
   */
  const mapColor = useCallback(
    (logicalColor: string): string => {
      const table = isDark ? darkMap : lightMap;
      return table[logicalColor] ?? logicalColor;
    },
    [isDark]
  );

  return (
    <ThemeContext.Provider value={{ mode, isDark, tokens, toggle, mapColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
