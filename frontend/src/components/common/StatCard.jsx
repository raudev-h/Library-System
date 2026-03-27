import { Skeleton } from './Skeleton';
import './StatCard.css';

export function StatCard({ label, value, icon, color = 'accent', loading }) {
  if (loading) {
    return (
      <div className="stat-card">
        <Skeleton width="40px" height="40px" className="stat-card-icon-skel" />
        <div className="stat-card-body">
          <Skeleton height="12px" width="80px" />
          <Skeleton height="28px" width="60px" />
        </div>
      </div>
    );
  }

  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">{value}</span>
      </div>
    </div>
  );
}
