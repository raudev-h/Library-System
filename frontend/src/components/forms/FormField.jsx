import './FormField.css';

export function FormField({ label, error, children, required }) {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export function FormInput({ ...props }) {
  return <input className="form-input" {...props} />;
}

export function FormSelect({ children, ...props }) {
  return <select className="form-select" {...props}>{children}</select>;
}

export function FormTextarea({ ...props }) {
  return <textarea className="form-input form-textarea" {...props} />;
}
