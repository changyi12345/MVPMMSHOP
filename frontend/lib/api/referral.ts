import { apiFetch } from './client';

export interface ReferralStats {
  code: string;
  referralCount: number;
  totalEarnings: number;
  rewardPerReferral: number;
  history: { username: string; date: string; reward: number }[];
}

export function fetchReferralStats() {
  return apiFetch<ReferralStats>('/referral');
}
