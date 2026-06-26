export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface GamePackage {
  id: string;
  name: string;
  amount: number;
  price: number;
}

export interface Game {
  slug: string;
  name: string;
  type: 'direct_topup' | 'voucher';
  icon: string;
  minPrice: number;
  description: string;
  requiredFields: string[];
  hasServers: boolean;
  servers?: { id: string; name: string }[];
  packages: GamePackage[];
}

export interface Voucher {
  id: number;
  name: string;
  faceValue: string;
  price: number;
  stock: number;
  category: string;
}

export const games: Game[] = [
  {
    slug: 'mlbb',
    name: 'Mobile Legends: Bang Bang',
    type: 'direct_topup',
    icon: '⚔️',
    minPrice: 18000,
    description: 'Instant diamond top-up for Mobile Legends',
    requiredFields: ['userid', 'serverid'],
    hasServers: true,
    servers: [
      { id: '2001', name: 'Server 2001' },
      { id: '2002', name: 'Server 2002' },
      { id: '2003', name: 'Server 2003' },
    ],
    packages: [
      { id: 'p1', name: '50 Diamonds', amount: 50, price: 18000 },
      { id: 'p2', name: '100 Diamonds', amount: 100, price: 35000 },
      { id: 'p3', name: '250 Diamonds', amount: 250, price: 85000 },
      { id: 'p4', name: '500 Diamonds', amount: 500, price: 165000 },
    ],
  },
  {
    slug: 'pubgm',
    name: 'PUBG Mobile',
    type: 'direct_topup',
    icon: '🎯',
    minPrice: 15000,
    description: 'UC top-up delivered instantly to your account',
    requiredFields: ['userid'],
    hasServers: false,
    packages: [
      { id: 'p1', name: '60 UC', amount: 60, price: 15000 },
      { id: 'p2', name: '325 UC', amount: 325, price: 75000 },
      { id: 'p3', name: '660 UC', amount: 660, price: 145000 },
    ],
  },
  {
    slug: 'free-fire',
    name: 'Free Fire',
    type: 'direct_topup',
    icon: '🔥',
    minPrice: 12000,
    description: 'Diamonds top-up for Free Fire',
    requiredFields: ['userid'],
    hasServers: false,
    packages: [
      { id: 'p1', name: '50 Diamonds', amount: 50, price: 12000 },
      { id: 'p2', name: '100 Diamonds', amount: 100, price: 22000 },
      { id: 'p3', name: '310 Diamonds', amount: 310, price: 65000 },
    ],
  },
  {
    slug: 'hok',
    name: 'Honor of Kings',
    type: 'direct_topup',
    icon: '👑',
    minPrice: 20000,
    description: 'Token top-up for Honor of Kings',
    requiredFields: ['userid'],
    hasServers: false,
    packages: [
      { id: 'p1', name: '60 Tokens', amount: 60, price: 20000 },
      { id: 'p2', name: '300 Tokens', amount: 300, price: 95000 },
    ],
  },
];

export const vouchers: Voucher[] = [
  { id: 1, name: 'PUBG Mobile 60 UC Voucher', faceValue: '60 UC', price: 18000, stock: 50, category: 'PUBG' },
  { id: 2, name: 'PSN $10 Gift Card', faceValue: '$10', price: 45000, stock: 30, category: 'PlayStation' },
  { id: 3, name: 'Razer Gold 100', faceValue: '100 RG', price: 35000, stock: 20, category: 'Razer' },
  { id: 4, name: 'Steam Wallet $5', faceValue: '$5', price: 25000, stock: 40, category: 'Steam' },
];

export const cartItems = [
  { id: 1, name: 'Mobile Legends 100 Diamonds', price: 35000, quantity: 1, playerInfo: 'ProPlayer123 | Server 2001' },
  { id: 2, name: 'PUBG Mobile 60 UC Voucher', price: 18000, quantity: 2 },
];

export const orders = [
  {
    id: 'ORD001',
    date: '2026-06-20',
    status: 'COMPLETED' as OrderStatus,
    total: 61000,
    items: ['Mobile Legends 100 Diamonds', 'PUBG Mobile 60 UC x2'],
    paymentMethod: 'KBZ Pay',
    voucherCodes: ['ABCD-EFGH-IJKL-MNOP'],
    timeline: [
      { label: 'Order Placed', time: 'Jun 20, 10:00 AM', done: true },
      { label: 'Payment Verified', time: 'Jun 20, 10:15 AM', done: true },
      { label: 'Processing', time: 'Jun 20, 10:16 AM', done: true },
      { label: 'Completed', time: 'Jun 20, 10:18 AM', done: true },
    ],
  },
  {
    id: 'ORD002',
    date: '2026-06-25',
    status: 'PENDING' as OrderStatus,
    total: 25000,
    items: ['Mobile Legends 100 Diamonds'],
    paymentMethod: 'Wave Pay',
    voucherCodes: [],
    timeline: [
      { label: 'Order Placed', time: 'Jun 25, 09:00 AM', done: true },
      { label: 'Payment Verified', time: '', done: false },
      { label: 'Processing', time: '', done: false },
      { label: 'Completed', time: '', done: false },
    ],
  },
];

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}

import { formatPrice as formatMmkPrice } from './format-price';

export function formatPrice(amount: number): string {
  return formatMmkPrice(amount);
}

export type WalletTxnType = 'topup' | 'spend' | 'refund';
export type WalletTxnStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

export interface WalletTransaction {
  id: number;
  type: WalletTxnType;
  amount: number;
  balanceAfter: number;
  status: WalletTxnStatus;
  description: string;
  createdAt: string;
}

export const walletBalance = 150000;

export const walletTransactions: WalletTransaction[] = [
  {
    id: 1,
    type: 'topup',
    amount: 100000,
    balanceAfter: 150000,
    status: 'COMPLETED',
    description: 'Top-up via KBZ Pay',
    createdAt: '2026-06-24T10:30:00',
  },
  {
    id: 2,
    type: 'spend',
    amount: 35000,
    balanceAfter: 50000,
    status: 'COMPLETED',
    description: 'Order ORD001 — MLBB 100 Diamonds',
    createdAt: '2026-06-20T10:18:00',
  },
  {
    id: 3,
    type: 'topup',
    amount: 85000,
    balanceAfter: 85000,
    status: 'COMPLETED',
    description: 'Top-up via Wave Pay',
    createdAt: '2026-06-18T14:00:00',
  },
  {
    id: 4,
    type: 'topup',
    amount: 50000,
    balanceAfter: 50000,
    status: 'PENDING',
    description: 'Top-up via Bank Transfer',
    createdAt: '2026-06-25T09:00:00',
  },
];

export const walletTopUpAmounts = [10000, 25000, 50000, 100000, 250000, 500000];
