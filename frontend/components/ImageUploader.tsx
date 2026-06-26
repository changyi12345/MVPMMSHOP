'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { uploadAdminImage } from '@/lib/api/upload';
import { resolveMediaUrl } from '@/lib/media-url';

interface ImageUploaderProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  hint?: string;
}

export default function ImageUploader({ label, value, onChange, hint }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const preview = resolveMediaUrl(value);

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const url = await uploadAdminImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {preview && (
        <div className="image-upload-preview">
          <Image src={preview} alt="Preview" width={200} height={120} unoptimized style={{ objectFit: 'contain', maxHeight: 120 }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
        <button type="button" className="btn btn-secondary btn-sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? 'Uploading...' : '📷 Upload Image'}
        </button>
        {value && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange(null)}>
            Remove
          </button>
        )}
      </div>
      {hint && <p style={{ fontSize: 12, color: 'var(--dark-gray)', marginTop: 8 }}>{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
