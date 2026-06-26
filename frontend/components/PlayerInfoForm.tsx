'use client';

import { GameFieldDefinition } from '@/lib/game-fields';

interface PlayerInfoFormProps {
  fields: GameFieldDefinition[];
  notes: string | null;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onValidate: () => void;
  validating: boolean;
  validated: boolean;
  playerName: string;
  error: string;
}

export default function PlayerInfoForm({
  fields,
  notes,
  values,
  onChange,
  onValidate,
  validating,
  validated,
  playerName,
  error,
}: PlayerInfoFormProps) {
  return (
    <>
      {notes && (
        <div style={{
          background: 'rgba(74,144,226,0.1)',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 14,
          color: 'var(--dark-gray)',
        }}>
          ℹ️ {notes}
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name} className="form-group">
          <label className="form-label">
            {field.label} {field.required && '*'}
          </label>
          {field.type === 'select' && field.options ? (
            <select
              className="form-select"
              value={values[field.name] ?? ''}
              onChange={(e) => onChange(field.name, e.target.value)}
            >
              <option value="">Select {field.label}</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="form-input"
              placeholder={`Enter ${field.label}`}
              value={values[field.name] ?? ''}
              onChange={(e) => onChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}

      {error && <p className="form-error">{error}</p>}

      <button
        className="btn btn-blue"
        onClick={onValidate}
        disabled={validating}
      >
        {validating ? 'Validating...' : '🔍 Validate Player'}
      </button>

      {validated && playerName && (
        <p className="form-success">✅ Player: {playerName}</p>
      )}
    </>
  );
}
