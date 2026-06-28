import { apiFetch } from './client';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  referralCode: string;
  walletBalance: number;
  emailVerified: boolean;
  avatarUrl: string | null;
  phone: string | null;
  phoneVerified: boolean;
}

export interface ReferralStats {
  code: string;
  referralCount: number;
  totalEarnings: number;
  rewardPerReferral: number;
  history: { username: string; date: string; reward: number }[];
}

export function fetchProfile() {
  return apiFetch<UserProfile>('/auth/me');
}

export function fetchReferralStats() {
  return apiFetch<ReferralStats>('/referral');
}

export function changePassword(data: { currentPassword: string; newPassword: string }) {
  return apiFetch<{ message: string }>('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
