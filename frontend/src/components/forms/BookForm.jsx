import { useState } from 'react';
import { createBook, updateBook } from '../../api/books';
import { useToast } from '../../context/ToastContext';
import { FormField, FormInput } from './FormField';
import './BookForm.css';
import '../common/ConfirmDialog.css';

const empty = { title: '', isbn: '', total_copies: 1, author: [] };

export function BookForm({ book, authors, onSuccess, onCancel }) {
  const isEdit = !!book;
  const [form, setForm] = useState(isEdit ? {
    title: book.title,
    isbn: book.isbn,
    total_copies: book.total_copies,
    author: book.author.map((a) => a.id),
  } : { ...empty });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleAuthor = (id) => {
    setForm((prev) => ({
      ...prev,
      author: prev.author.includes(id)
        ? prev.author.filter((a) => a !== id)
        : [...prev.author, id],
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = 'Required';
    if (!form.isbn?.trim()) errs.isbn = 'Required';
    if (form.total_copies < 0) errs.total_copies = 'Must be 0 or more';
    if (!isEdit && form.author.length === 0) errs.author = 'Select at least one author';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await updateBook(book.id, { title: form.title, total_copies: Number(form.total_copies) });
        addToast('success', 'Book updated');
      } else {
        await createBook({ title: form.title, isbn: form.isbn, total_copies: Number(form.total_copies), author: form.author });
        addToast('success', 'Book created');
      }
      onSuccess();
    } catch (err) {
      addToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <FormField label="Title" error={errors.title} required>
        <FormInput value={form.title} onChange={set('title')} placeholder="One Hundred Years of Solitude" />
      </FormField>
      <div className="form-grid form-grid-2">
        <FormField label="ISBN" error={errors.isbn} required>
          <FormInput value={form.isbn} onChange={set('isbn')} placeholder="978-3-16-148410-0" disabled={isEdit} />
        </FormField>
        <FormField label="Total Copies" error={errors.total_copies} required>
          <FormInput type="number" min="0" value={form.total_copies} onChange={set('total_copies')} />
        </FormField>
      </div>
      {!isEdit && (
        <FormField label="Authors" error={errors.author} required>
          <div className="author-checklist">
            {authors.length === 0 && (
              <p className="author-checklist-empty">No authors yet — create one first.</p>
            )}
            {authors.map((a) => (
              <label key={a.id} className="author-check">
                <input
                  type="checkbox"
                  checked={form.author.includes(a.id)}
                  onChange={() => toggleAuthor(a.id)}
                />
                <span>{a.first_name} {a.last_name}</span>
              </label>
            ))}
          </div>
        </FormField>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Update Book' : 'Create Book'}
        </button>
      </div>
    </form>
  );
}
