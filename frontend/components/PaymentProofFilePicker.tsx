'use client';

import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/lib/useLang';
import { resolveMediaUrl } from '@/lib/media-url';

interface PaymentProofFilePickerProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  inputId?: string;
}

export default function PaymentProofFilePicker({
  file,
  onFileChange,
  inputId = 'payment-proof-file',
}: PaymentProofFilePickerProps) {
  const { t } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    onFileChange(picked);
  };

  return (
    <>
      <div
        className="upload-zone"
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={t('uploadScreenshot')}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Payment proof preview"
            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: 8 }}
          />
        ) : (
          <div className="upload-icon">📤</div>
        )}
        <p>{file?.name ?? t('uploadScreenshot')}</p>
        <p style={{ fontSize: 12, color: 'var(--dark-gray)', marginTop: 4 }}>
          {t('fileSizeHint')}
        </p>
      </div>
      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleChange}
        aria-hidden
      />
    </>
  );
}

export function resolveProofImageUrl(url: string | null | undefined): string | null {
  return resolveMediaUrl(url);
}
