import './StatusBanner.css';

const VARIANT_CLASS = {
  info: 'status-banner',
  error: 'status-banner status-banner--error',
};

function StatusBanner({ message, variant = 'info', actionLabel, onAction }) {
  if (!message) return null;
  const className = VARIANT_CLASS[variant] || VARIANT_CLASS.info;
  return (
    <div className={className} role="status" aria-live="polite">
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          className="status-banner__action"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default StatusBanner;
