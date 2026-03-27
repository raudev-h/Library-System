import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getLoans, returnLoan } from '../../api/loans';
import { getUsers } from '../../api/users';
import { getBooks } from '../../api/books';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../hooks/useModal';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoanForm } from '../../components/forms/LoanForm';
import './LoansManagement.css';

const today = new Date().toISOString().split('T')[0];
const LIMIT = 10;

function isOverdue(loan) {
  return !loan.is_returned && loan.due_date < today;
}

export default function LoansManagement() {
  const [tab, setTab] = useState('active');
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null);
  const { addToast } = useToast();
  const createModal = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      createModal.open();
      setSearchParams({});
    }
  }, [searchParams]);

  const fetchLoans = useCallback(() => {
    setLoading(true);
    getLoans({ is_returned: tab === 'history', skip, limit: LIMIT })
      .then((res) => setLoans(res.data))
      .catch(() => addToast('error', 'Failed to load loans'))
      .finally(() => setLoading(false));
  }, [tab, skip]);

  const fetchMeta = () => {
    Promise.all([getUsers(), getBooks()]).then(([uRes, bRes]) => {
      setUsers(uRes.data);
      setBooks(bRes.data);
    });
  };

  useEffect(() => { fetchMeta(); }, []);
  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSkip(0);
  };

  const handleReturn = async (loan) => {
    setReturning(loan.id);
    try {
      await returnLoan(loan.id);
      addToast('success', 'Loan returned successfully');
      fetchLoans();
    } catch (err) {
      addToast('error', err.message);
    } finally {
      setReturning(null);
    }
  };

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const bookMap = Object.fromEntries(books.map((b) => [b.id, b]));

  const columns = [
    { key: 'book', label: 'Book', render: (l) => {
      const b = bookMap[l.book_id];
      return b ? <Link to={`/books/${b.id}`}>{b.title}</Link> : <span className="text-muted">—</span>;
    }},
    { key: 'member', label: 'Member', render: (l) => {
      const u = userMap[l.user_id];
      return u ? <Link to={`/members/${u.id}`}>{u.name}</Link> : <span className="text-muted">—</span>;
    }},
    { key: 'loan_date', label: 'Loan Date', render: (l) => new Date(l.loan_date).toLocaleDateString() },
    { key: 'due_date', label: 'Due Date', render: (l) => (
      <span style={{ color: isOverdue(l) ? 'var(--red)' : 'inherit' }}>
        {new Date(l.due_date).toLocaleDateString()}
      </span>
    )},
    ...(tab === 'history' ? [{ key: 'return_date', label: 'Returned', render: (l) => l.return_date ? new Date(l.return_date).toLocaleDateString() : '—' }] : []),
    { key: 'status', label: 'Status', render: (l) => {
      if (l.is_returned) return <Badge variant="returned">Returned</Badge>;
      if (isOverdue(l)) return <Badge variant="overdue">Overdue</Badge>;
      return <Badge variant="active">Active</Badge>;
    }},
    ...(tab === 'active' ? [{
      key: 'actions', label: '', width: '100px', render: (l) => (
        <button
          className="btn btn-outline btn-sm"
          onClick={() => handleReturn(l)}
          disabled={returning === l.id}
        >
          {returning === l.id ? '…' : 'Return'}
        </button>
      ),
    }] : []),
  ];

  return (
    <div className="page-container">
      <div className="loans-tabs">
        <button
          className={`tab-btn ${tab === 'active' ? 'tab-btn--active' : ''}`}
          onClick={() => handleTabChange('active')}
        >
          Active Loans
        </button>
        <button
          className={`tab-btn ${tab === 'history' ? 'tab-btn--active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          History
        </button>
      </div>

      <Table columns={columns} data={loans} loading={loading} emptyMessage={tab === 'active' ? 'No active loans.' : 'No loan history.'} />

      <div className="pagination">
        <button className="btn btn-ghost btn-sm" disabled={skip === 0} onClick={() => setSkip(skip - LIMIT)}>
          ← Previous
        </button>
        <span className="pagination-info">
          {skip + 1}–{skip + loans.length}
        </span>
        <button className="btn btn-ghost btn-sm" disabled={loans.length < LIMIT} onClick={() => setSkip(skip + LIMIT)}>
          Next →
        </button>
      </div>

      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="New Loan">
        <LoanForm
          users={users}
          books={books}
          onSuccess={() => { createModal.close(); fetchLoans(); fetchMeta(); }}
          onCancel={createModal.close}
        />
      </Modal>
    </div>
  );
}
