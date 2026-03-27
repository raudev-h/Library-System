import './EmptyState.css';

export function EmptyState({ icon = '📚', title = 'Nothing here yet', message }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <h4 className="empty-state-title">{title}</h4>
      {message && <p className="empty-state-message">{message}</p>}
    </div>
  );
}
