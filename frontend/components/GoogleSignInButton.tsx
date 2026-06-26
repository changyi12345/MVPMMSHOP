'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { loginWithGoogle, saveAuth } from '@/lib/api/auth';
import { useLang } from '@/lib/useLang';

interface Props {
  onSuccess: () => void;
  onError?: (message: string) => void;
  referralCode?: string;
}

export default function GoogleSignInButton({ onSuccess, onError, referralCode }: Props) {
  const { t } = useLang();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) return null;

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      onError?.(t('googleLoginFailed'));
      return;
    }
    try {
      const result = await loginWithGoogle({
        idToken: response.credential,
        referralCode,
      });
      saveAuth(result);
      onSuccess();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('googleLoginFailed'));
    }
  };

  return (
    <div className="google-auth-block">
      <div className="auth-divider">
        <span>{t('orContinueWith')}</span>
      </div>
      <div className="google-btn-wrap">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError?.(t('googleLoginFailed'))}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="360"
        />
      </div>
    </div>
  );
}
