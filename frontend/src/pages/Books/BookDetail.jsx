import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBookById, deleteBook } from '../../api/books';
import { getLoans } from '../../api/loans';
import { getUsers } from '../../api/users';
import { getAuthors } from '../../api/authors';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../hooks/useModal';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Skeleton } from '../../components/common/Skeleton';
import { BookForm } from '../../components/forms/BookForm';
import './BookDetail.css';

const today = new Date().toISOString().split('T')[0];

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const editModal = useModal();
  const deleteModal = useModal();

  const [book, setBook] = useState(null);
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = () => {
    Promise.all([
      getBookById(id),
      getLoans({ limit: 100 }),
      getUsers(),
      getAuthors(),
    ]).then(([bookRes, loansRes, usersRes, authorsRes]) => {
      setBook(bookRes.data);
      setLoans(loansRes.data.filter((l) => l.book_id === id));
      setUsers(usersRes.data);
      setAuthors(authorsRes.data);
    }).catch(() => addToast('error', 'Failed to load book'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [id]);

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBook(id);
      addToast('success', 'Book deleted');
      navigate('/books');
    } catch (err) {
      addToast('error', err.message);
      deleteModal.close();
    } finally {
      setDeleting(false);
    }
  };

  const loanColumns = [
    { key: 'member', label: 'Member', render: (l) => {
      const u = userMap[l.user_id];
      return u ? <Link to={`/members/${u.id}`}>{u.name}</Link> : <span className="text-muted">—</span>;
    }},
    { key: 'loan_date', label: 'Loan Date', render: (l) => new Date(l.loan_date).toLocaleDateString() },
    { key: 'due_date', label: 'Due Date', render: (l) => new Date(l.due_date).toLocaleDateString() },
    { key: 'return_date', label: 'Returned', render: (l) => l.return_date ? new Date(l.return_date).toLocaleDateString() : '—' },
    { key: 'status', label: 'Status', render: (l) => {
      if (l.is_returned) return <Badge variant="returned">Returned</Badge>;
      if (!l.is_returned && l.due_date < today) return <Badge variant="overdue">Overdue</Badge>;
      return <Badge variant="active">Active</Badge>;
    }},
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="book-detail-header">
          <Skeleton height="32px" width="280px" />
          <Skeleton height="20px" width="160px" />
        </div>
        <Skeleton height="100px" />
      </div>
    );
  }

  if (!book) return <div className="page-container"><p className="text-muted">Book not found.</p></div>;

  return (
    <div className="page-container">
      <div className="book-detail-header">
        <div className="book-detail-title-row">
          <h2 className="book-detail-title">{book.title}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline btn-sm" onClick={() => editModal.open(book)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={deleteModal.open}>Delete</button>
          </div>
        </div>
        <div className="book-detail-meta">
          <span className="book-detail-isbn">ISBN: {book.isbn}</span>
          <Badge variant={book.is_active ? 'active' : 'inactive'}>{book.is_active ? 'Active' : 'Inactive'}</Badge>
          <Badge variant={book.available_copies > 0 ? 'available' : 'unavailable'}>
            {book.available_copies}/{book.total_copies} copies available
          </Badge>
        </div>
      </div>

      <div className="book-detail-authors">
        <h4 className="book-detail-section-label">Authors</h4>
        <div className="author-tags">
          {book.author.length === 0 ? (
            <span className="text-muted">No authors assigned</span>
          ) : book.author.map((a) => (
            <span key={a.id} className="author-tag">{a.first_name} {a.last_name}</span>
          ))}
        </div>
      </div>

      <section>
        <h4 className="book-detail-section-label" style={{ marginBottom: '12px' }}>Loan History ({loans.length})</h4>
        <Table columns={loanColumns} data={loans} loading={false} emptyMessage="No loans for this book." />
      </section>

      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Book">
        {editModal.data && (
          <BookForm
            book={editModal.data}
            authors={authors}
            onSuccess={() => { editModal.close(); fetchAll(); }}
            onCancel={editModal.close}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Delete Book"
        message={`Are you sure you want to delete "${book.title}"? Books with active loans cannot be deleted.`}
        loading={deleting}
      />
    </div>
  );
}
