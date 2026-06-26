export interface FeatureFlags {
  registrationEnabled: boolean;
  googleLoginEnabled: boolean;
  walletEnabled: boolean;
  walletTopupEnabled: boolean;
  referralEnabled: boolean;
  promoCodesEnabled: boolean;
  userOrderCancelEnabled: boolean;
  gamesTopupEnabled: boolean;
  voucherShopEnabled: boolean;
  eventsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  liveChatEnabled: boolean;
  smsOtpEnabled: boolean;
  smsOrderAlertsEnabled: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  registrationEnabled: true,
  googleLoginEnabled: true,
  walletEnabled: true,
  walletTopupEnabled: true,
  referralEnabled: true,
  promoCodesEnabled: true,
  userOrderCancelEnabled: true,
  gamesTopupEnabled: true,
  voucherShopEnabled: true,
  eventsEnabled: true,
  emailNotificationsEnabled: true,
  liveChatEnabled: true,
  smsOtpEnabled: false,
  smsOrderAlertsEnabled: false,
};

export function mergeFeatureFlags(partial?: Partial<FeatureFlags> | null): FeatureFlags {
  return { ...DEFAULT_FEATURE_FLAGS, ...partial };
}
