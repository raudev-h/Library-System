import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../../api/users';
import { getBooks } from '../../api/books';
import { getLoans } from '../../api/loans';
import { StatCard } from '../../components/common/StatCard';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import './Dashboard.css';

const today = new Date().toISOString().split('T')[0];

function isOverdue(loan) {
  return !loan.is_returned && loan.due_date < today;
}

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUsers(),
      getBooks(),
      getLoans({ is_returned: false, limit: 100 }),
      getLoans({ skip: 0, limit: 8 }),
    ]).then(([usersRes, booksRes, activeRes, recentRes]) => {
      setUsers(usersRes.data);
      setBooks(booksRes.data);
      setActiveLoans(activeRes.data);
      setRecentLoans(recentRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const bookMap = Object.fromEntries(books.map((b) => [b.id, b]));

  const overdueCount = activeLoans.filter(isOverdue).length;
  const activeCount = users.filter((u) => u.is_active).length;

  const loanColumns = [
    { key: 'book', label: 'Book', render: (row) => {
      const book = bookMap[row.book_id];
      return book ? <Link to={`/books/${book.id}`}>{book.title}</Link> : <span className="text-muted">—</span>;
    }},
    { key: 'member', label: 'Member', render: (row) => {
      const user = userMap[row.user_id];
      return user ? <Link to={`/members/${user.id}`}>{user.name}</Link> : <span className="text-muted">—</span>;
    }},
    { key: 'loan_date', label: 'Loan Date', render: (row) => new Date(row.loan_date).toLocaleDateString() },
    { key: 'due_date', label: 'Due', render: (row) => (
      <span style={{ color: isOverdue(row) ? 'var(--red)' : 'inherit' }}>
        {new Date(row.due_date).toLocaleDateString()}
      </span>
    )},
    { key: 'status', label: 'Status', render: (row) => {
      if (row.is_returned) return <Badge variant="returned">Returned</Badge>;
      if (isOverdue(row)) return <Badge variant="overdue">Overdue</Badge>;
      return <Badge variant="active">Active</Badge>;
    }},
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        <StatCard label="Total Books" value={books.filter(b => b.is_active).length} color="accent" loading={loading} icon={<BookIcon />} />
        <StatCard label="Active Members" value={activeCount} color="green" loading={loading} icon={<UsersIcon />} />
        <StatCard label="Active Loans" value={activeLoans.length} color="amber" loading={loading} icon={<LoanIcon />} />
        <StatCard label="Overdue" value={overdueCount} color={overdueCount > 0 ? 'red' : 'accent'} loading={loading} icon={<AlertIcon />} />
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Recent Loans</h3>
          <Link to="/loans" className="section-link">View all →</Link>
        </div>
        <Table
          columns={loanColumns}
          data={loading ? null : recentLoans}
          loading={loading}
          emptyMessage="No loans yet."
        />
      </section>

      <div className="dashboard-quick">
        <Link to="/books" className="quick-card">
          <span className="quick-card-icon"><BookIcon /></span>
          <span>Browse Catalog</span>
        </Link>
        <Link to="/loans" className="quick-card">
          <span className="quick-card-icon"><LoanIcon /></span>
          <span>Manage Loans</span>
        </Link>
        <Link to="/members" className="quick-card">
          <span className="quick-card-icon"><UsersIcon /></span>
          <span>View Members</span>
        </Link>
      </div>
    </div>
  );
}

function BookIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
}
function UsersIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
}
function LoanIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
}
function AlertIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}
