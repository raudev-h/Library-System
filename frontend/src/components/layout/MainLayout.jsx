import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import './MainLayout.css';

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNew = () => {
    const base = '/' + location.pathname.split('/')[1];
    const search = new URLSearchParams('new=1');
    navigate({ pathname: base, search: search.toString() });
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <TopHeader onNew={handleNew} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
