import { useState } from 'react';
import { createAuthor, updateAuthor } from '../../api/authors';
import { useToast } from '../../context/ToastContext';
import { FormField, FormInput, FormTextarea } from './FormField';
import '../common/ConfirmDialog.css';
import './FormField.css';

const today = new Date().toISOString().split('T')[0];

const empty = { first_name: '', last_name: '', birth_date: '', nationality: '', biography: '' };

export function AuthorForm({ author, onSuccess, onCancel }) {
  const isEdit = !!author;
  const [form, setForm] = useState(isEdit ? {
    first_name: author.first_name,
    last_name: author.last_name,
    birth_date: author.birth_date,
    nationality: author.nationality,
    biography: author.biography,
  } : { ...empty });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.first_name || form.first_name.length < 3) errs.first_name = 'Min 3 characters';
    if (!form.last_name || form.last_name.length < 2) errs.last_name = 'Min 2 characters';
    if (!form.birth_date) errs.birth_date = 'Required';
    if (form.birth_date > today) errs.birth_date = 'Cannot be in the future';
    if (!form.nationality || form.nationality.length < 4) errs.nationality = 'Min 4 characters';
    if (!form.biography || form.biography.length < 5) errs.biography = 'Min 5 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await updateAuthor(author.id, form);
        addToast('success', 'Author updated');
      } else {
        await createAuthor(form);
        addToast('success', 'Author created');
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
      <div className="form-grid form-grid-2">
        <FormField label="First Name" error={errors.first_name} required>
          <FormInput value={form.first_name} onChange={set('first_name')} placeholder="Gabriel" />
        </FormField>
        <FormField label="Last Name" error={errors.last_name} required>
          <FormInput value={form.last_name} onChange={set('last_name')} placeholder="García Márquez" />
        </FormField>
      </div>
      <div className="form-grid form-grid-2">
        <FormField label="Birth Date" error={errors.birth_date} required>
          <FormInput type="date" value={form.birth_date} onChange={set('birth_date')} max={today} />
        </FormField>
        <FormField label="Nationality" error={errors.nationality} required>
          <FormInput value={form.nationality} onChange={set('nationality')} placeholder="Colombian" />
        </FormField>
      </div>
      <FormField label="Biography" error={errors.biography} required>
        <FormTextarea value={form.biography} onChange={set('biography')} placeholder="Short biography…" rows={3} />
      </FormField>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Update Author' : 'Create Author'}
        </button>
      </div>
    </form>
  );
}
