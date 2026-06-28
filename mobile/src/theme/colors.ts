/** Violet/cyan brand palette — matches web globals.css (light theme) */
export const colors = {
  violet: '#6366f1',
  violetDark: '#4f46e5',
  violetLight: '#8b5cf6',
  cyan: '#06b6d4',
  cyanDark: '#0891b2',
  accent: '#06b6d4',
  primary: '#6366f1',
  pink: '#ec4899',
  amber: '#f59e0b',
  kicker: '#d97706',

  red: '#ef4444',
  green: '#22C55E',
  yellow: '#fbbf24',

  /** Page background — matches web --gray / home-page */
  background: '#f1f5f9',
  backgroundTop: '#eef2ff',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  border: '#e2e8f0',
  borderBrand: 'rgba(99, 102, 241, 0.1)',

  text: '#0f172a',
  textTitle: '#0a1628',
  textMuted: '#64748b',

  header: '#312e81',
  headerDark: '#1e1b4b',

  white: '#FFFFFF',
  /** @deprecated prefer colors.background for page bg */
  black: '#f1f5f9',

  surfaceAlt: '#e2e8f0',
  darkGray: '#64748b',
  lightGray: '#cbd5e1',
  gray: '#f1f5f9',
  gold: '#a78bfa',
  blue: '#6366f1',

  /** @deprecated use colors.primary */
  brandGold: '#FFD700',
};

export const shadows = {
  card: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 20,
};
