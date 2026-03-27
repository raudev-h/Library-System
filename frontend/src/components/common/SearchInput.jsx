import './SearchInput.css';

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search-input-wrap">
      <svg className="search-icon" viewBox="0 0 20 20" fill="none">
        <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')} aria-label="Clear">
          ✕
        </button>
      )}
    </div>
  );
}
