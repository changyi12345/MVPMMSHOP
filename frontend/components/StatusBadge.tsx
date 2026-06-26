'use client';

import { getStatusClass } from '@/lib/status';
import { useLang } from '@/lib/useLang';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { ts } = useLang();
  return <span className={getStatusClass(status)}>{ts(status)}</span>;
}
