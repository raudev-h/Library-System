import { useState } from 'react';
import { createLoan } from '../../api/loans';
import { useToast } from '../../context/ToastContext';
import { FormField, FormSelect } from './FormField';
import '../common/ConfirmDialog.css';

export function LoanForm({ users, books, onSuccess, onCancel }) {
  const [form, setForm] = useState({ user_id: '', book_id: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const availableBooks = books.filter((b) => b.is_active && b.available_copies > 0);
  const activeUsers = users.filter((u) => u.is_active);

  const validate = () => {
    const errs = {};
    if (!form.user_id) errs.user_id = 'Select a member';
    if (!form.book_id) errs.book_id = 'Select a book';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await createLoan(form);
      addToast('success', 'Loan created — 15 days duration');
      onSuccess();
    } catch (err) {
      addToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <FormField label="Member" error={errors.user_id} required>
        <FormSelect value={form.user_id} onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))}>
          <option value="">Select member…</option>
          {activeUsers.map((u) => (
            <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
          ))}
        </FormSelect>
      </FormField>
      <FormField label="Book" error={errors.book_id} required>
        <FormSelect value={form.book_id} onChange={(e) => setForm((p) => ({ ...p, book_id: e.target.value }))}>
          <option value="">Select book…</option>
          {availableBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} ({b.available_copies} available)
            </option>
          ))}
        </FormSelect>
      </FormField>
      {availableBooks.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No books available for loan at this time.
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading || availableBooks.length === 0}>
          {loading ? 'Creating…' : 'Create Loan'}
        </button>
      </div>
    </form>
  );
}
