import type { ChangeEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

type AuthFieldProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  type: 'email' | 'text';
  value: string;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
  variant?: 'compact' | 'panel';
  onChange: (value: string) => void;
};

export default function AuthField({
  id,
  label,
  icon: Icon,
  type,
  value,
  placeholder,
  autoComplete,
  required = true,
  variant = 'compact',
  onChange,
}: AuthFieldProps) {
  if (variant === 'panel') {
    return (
      <div className="ob-field">
        <label htmlFor={id} className="ob-label">
          {label}
        </label>
        <div className="ob-field-inner">
          <Icon
            size={17}
            className="ob-field-icon"
            style={{ color: value ? 'var(--ob-primary)' : undefined }}
          />
          <input
            id={id}
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`ob-input-v2${value ? ' has-value' : ''}`}
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
          />
        </div>
      </div>
    );
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);

  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--ob-text)',
          marginBottom: 7,
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon
          size={17}
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--ob-text-faint)',
            pointerEvents: 'none',
          }}
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          className="ob-input"
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
      </div>
    </div>
  );
}
