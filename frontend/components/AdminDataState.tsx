'use client';

interface AdminDataStateProps {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function AdminDataState({ loading, error, onRetry }: AdminDataStateProps) {
  if (loading) {
    return (
      <div className="admin-banner admin-banner-info">
        Loading data from server...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-banner admin-banner-error">
        <span>⚠️ {error}</span>
        {onRetry && (
          <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return null;
}
