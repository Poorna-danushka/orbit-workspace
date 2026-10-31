type AuthAlertProps = {
  message: string;
  variant?: 'inline' | 'panel';
  marginBottom?: number;
};

export default function AuthAlert({ message, variant = 'inline', marginBottom }: AuthAlertProps) {
  if (!message) return null;

  if (variant === 'panel') {
    return (
      <div className="ob-error-alert" role="alert">
        <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>⚠️</span>
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      style={{
        marginBottom,
        padding: '12px 16px',
        borderRadius: 12,
        background: 'rgba(244,63,94,0.1)',
        border: '1px solid rgba(244,63,94,0.25)',
        color: '#f43f5e',
        fontSize: '0.875rem',
      }}
    >
      {message}
    </div>
  );
}
