/** Violet/cyan brand palette — matches web globals.css */
export const colors = {
  violet: '#6366f1',
  violetDark: '#4f46e5',
  violetLight: '#8b5cf6',
  cyan: '#06b6d4',
  cyanDark: '#0891b2',
  accent: '#06b6d4',
  primary: '#6366f1',

  red: '#ef4444',
  white: '#FFFFFF',
  black: '#0f0f14',
  surface: '#1a1a24',
  surfaceAlt: '#252532',
  gold: '#a78bfa',
  blue: '#6366f1',
  gray: '#f4f4f8',
  darkGray: '#9ca3af',
  lightGray: '#374151',
  green: '#22C55E',
  yellow: '#fbbf24',

  /** @deprecated use colors.primary */
  brandGold: '#FFD700',
};

export const gradients = {
  brand: ['#6366f1', '#8b5cf6', '#06b6d4'] as const,
  hero: ['#4f46e5', '#7c3aed', '#0891b2'] as const,
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
