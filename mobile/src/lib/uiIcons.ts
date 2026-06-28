export type TabId = 'home' | 'games' | 'vouchers' | 'cart' | 'orders' | 'profile';

/** Launcher / splash — tab bar uses vector icons in TabIcon.tsx */
export const APP_ICON = require('../../assets/icons/app-icon.png');

/** Web Header / HomeContent emoji parity (section badges, features) */
export const UI_EMOJI = {
  home: '🏠',
  games: '🎮',
  vouchers: '🎁',
  cart: '🛒',
  orders: '📦',
  profile: '👤',
  wallet: '💰',
  events: '📢',
  hot: '🔥',
  new: '✨',
  trust: '🛡️',
  flash: '⚡',
  lock: '🔒',
  chat: '💬',
  referral: '🎁',
  notify: '🔔',
} as const;
