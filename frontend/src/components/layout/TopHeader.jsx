import { useLocation, useNavigate } from 'react-router-dom';
import './TopHeader.css';

const PAGE_TITLES = {
  '/':        { title: 'Dashboard', action: null },
  '/books':   { title: 'Book Catalog', action: { label: '+ New Book', path: '/books?new=1' } },
  '/loans':   { title: 'Loans', action: { label: '+ New Loan', path: '/loans?new=1' } },
  '/members': { title: 'Members', action: { label: '+ New Member', path: '/members?new=1' } },
  '/authors': { title: 'Authors', action: { label: '+ New Author', path: '/authors?new=1' } },
};

export function TopHeader({ onNew }) {
  const location = useLocation();
  const navigate = useNavigate();

  const base = '/' + location.pathname.split('/')[1];
  const page = PAGE_TITLES[base] || PAGE_TITLES[location.pathname] || { title: 'Library', action: null };

  return (
    <header className="top-header">
      <h2 className="top-header-title">{page.title}</h2>
      {page.action && (
        <button className="btn btn-primary btn-sm top-header-action" onClick={onNew}>
          {page.action.label}
        </button>
      )}
    </header>
  );
}
