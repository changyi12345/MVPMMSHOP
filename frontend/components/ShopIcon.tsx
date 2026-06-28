import type { ReactNode } from 'react';

type IconName =
  | 'home'
  | 'games'
  | 'vouchers'
  | 'cart'
  | 'orders'
  | 'profile'
  | 'bell'
  | 'wallet';

const paths: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" strokeWidth="1.75" />
    </>
  ),
  games: (
    <path
      d="M6 12h3m0 0v3m0-3v-3m7 1h.01M15 11h.01M8 20h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4z"
      strokeWidth="1.75"
    />
  ),
  vouchers: (
    <>
      <path d="M20 12v-1.5a2.5 2.5 0 0 0-5 0V12a2.5 2.5 0 0 0 5 0z" strokeWidth="1.75" />
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v14H6.5A2.5 2.5 0 0 1 4 16.5v-9z" strokeWidth="1.75" />
    </>
  ),
  cart: (
    <>
      <path d="M6 6h15l-1.5 9H8L6 6z" strokeWidth="1.75" />
      <circle cx="9.5" cy="19" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="19" r="1.25" fill="currentColor" stroke="none" />
    </>
  ),
  orders: (
    <>
      <path d="M7 4h10l2 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8l2-4z" strokeWidth="1.75" />
      <path d="M7 8h10" strokeWidth="1.75" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.25" strokeWidth="1.75" />
      <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" strokeWidth="1.75" />
    </>
  ),
  bell: (
    <>
      <path d="M12 4a4 4 0 0 0-4 4v2.5c0 .966-.384 1.892-1.07 2.574L6 14.5h12l-.93-1.426A3.63 3.63 0 0 1 16 10.5V8a4 4 0 0 0-4-4z" strokeWidth="1.75" />
      <path d="M10 17a2 2 0 0 0 4 0" strokeWidth="1.75" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9z" strokeWidth="1.75" />
      <path d="M16 12h3" strokeWidth="1.75" />
    </>
  ),
};

type Props = {
  name: IconName;
  size?: number;
  className?: string;
};

/** Crisp SVG icons for header + mobile tab bar */
export default function ShopIcon({ name, size = 22, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
