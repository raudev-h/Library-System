import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBooks } from '../../api/books';
import { getAuthors } from '../../api/authors';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../hooks/useModal';
import { useDebounce } from '../../hooks/useDebounce';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { BookForm } from '../../components/forms/BookForm';
import './BookCatalog.css';

export default function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [availFilter, setAvailFilter] = useState('all');
  const { addToast } = useToast();
  const createModal = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      createModal.open();
      setSearchParams({});
    }
  }, [searchParams]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getBooks(), getAuthors()])
      .then(([bRes, aRes]) => { setBooks(bRes.data); setAuthors(aRes.data); })
      .catch(() => addToast('error', 'Failed to load books'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = books
    .filter((b) => b.is_active)
    .filter((b) => {
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      const authorMatch = b.author.some((a) =>
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(q)
      );
      return b.title.toLowerCase().includes(q) || authorMatch;
    })
    .filter((b) => {
      if (availFilter === 'available') return b.available_copies > 0;
      if (availFilter === 'unavailable') return b.available_copies === 0;
      return true;
    });

  return (
    <div className="page-container">
      <div className="page-toolbar">
        <div style={{ flex: 1, maxWidth: 320 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Search by title or author…" />
        </div>
        <div className="filter-group">
          {['all', 'available', 'unavailable'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${availFilter === f ? 'filter-btn--active' : ''}`}
              onClick={() => setAvailFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="book-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="book-card">
              <Skeleton height="120px" />
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton height="16px" width="80%" />
                <Skeleton height="12px" width="60%" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📖"
          title="No books found"
          message={query ? `No results for "${query}". Try a different search.` : 'No books in the catalog yet.'}
        />
      ) : (
        <div className="book-grid">
          {filtered.map((book) => (
            <Link key={book.id} to={`/books/${book.id}`} className="book-card">
              <div className="book-cover">
                <span className="book-cover-letter">{book.title[0]}</span>
              </div>
              <div className="book-info">
                <h4 className="book-title">{book.title}</h4>
                <p className="book-authors">
                  {book.author.map((a) => `${a.first_name} ${a.last_name}`).join(', ') || 'Unknown author'}
                </p>
                <div className="book-meta">
                  <Badge variant={book.available_copies > 0 ? 'available' : 'unavailable'}>
                    {book.available_copies}/{book.total_copies} available
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Add New Book">
        <BookForm
          authors={authors}
          onSuccess={() => { createModal.close(); fetchData(); }}
          onCancel={createModal.close}
        />
      </Modal>
    </div>
  );
}
