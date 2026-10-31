'use client';

import { useState, type ReactNode } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
  variant?: 'compact' | 'panel';
  confirmValue?: string;
  labelAccessory?: ReactNode;
  onChange: (value: string) => void;
};

export default function PasswordField({
  id,
  label,
  value,
  placeholder,
  autoComplete,
  minLength,
  variant = 'compact',
  confirmValue,
  labelAccessory,
  onChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPanel = variant === 'panel';

  return (
    <div className={isPanel ? 'ob-field' : undefined}>
      <div
        style={
          isPanel
            ? {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 7,
              }
            : {
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--ob-text)',
                marginBottom: 7,
              }
        }
      >
        <label
          htmlFor={id}
          className={isPanel ? 'ob-label' : undefined}
          style={isPanel ? { margin: 0 } : undefined}
        >
          {label}
        </label>
        {labelAccessory}
      </div>
      <div
        className={isPanel ? 'ob-field-inner' : undefined}
        style={!isPanel ? { position: 'relative' } : undefined}
      >
        <Lock
          size={17}
          className={isPanel ? 'ob-field-icon' : undefined}
          style={{
            color: isPanel ? (value ? 'var(--ob-primary)' : undefined) : 'var(--ob-text-faint)',
            ...(!isPanel
              ? {
                  position: 'absolute' as const,
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none' as const,
                }
              : {}),
          }}
        />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={isPanel ? `ob-input-v2${value ? ' has-value' : ''}` : 'ob-input'}
          style={
            isPanel
              ? undefined
              : {
                  paddingRight: 48,
                  borderColor:
                    confirmValue && value
                      ? confirmValue === value
                        ? 'rgba(34,211,160,0.5)'
                        : 'rgba(244,63,94,0.5)'
                      : undefined,
                }
          }
          placeholder={placeholder}
          required
          minLength={minLength}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className={isPanel ? 'ob-input-action' : undefined}
          style={
            isPanel
              ? undefined
              : {
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ob-text-faint)',
                  padding: 0,
                }
          }
          aria-label={isPanel ? `${visible ? 'Hide' : 'Show'} password` : visible ? 'Hide' : 'Show'}
        >
          {visible ? <EyeOff size={isPanel ? 17 : 16} /> : <Eye size={isPanel ? 17 : 16} />}
        </button>
      </div>
      {confirmValue !== undefined && value.length > 0 && confirmValue !== value && (
        <p style={{ fontSize: '0.78rem', color: '#f43f5e', marginTop: 5 }}>
          Passwords do not match
        </p>
      )}
    </div>
  );
}
