import { useState } from 'react';
import { createUser, updateUser } from '../../api/users';
import { useToast } from '../../context/ToastContext';
import { FormField, FormInput } from './FormField';
import '../common/ConfirmDialog.css';

const empty = { name: '', email: '', password: '', confirm_password: '' };

export function UserForm({ user, onSuccess, onCancel }) {
  const isEdit = !!user;
  const [form, setForm] = useState(isEdit ? { name: user.name, email: user.email, password: '', confirm_password: '' } : { ...empty });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!isEdit) {
      if (!form.name || form.name.length < 3) errs.name = 'Min 3 characters';
      if (!form.email) errs.email = 'Required';
      if (!form.password || form.password.length < 8) errs.password = 'Min 8 characters';
      if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
    } else {
      if (!form.name || form.name.length < 3) errs.name = 'Min 3 characters';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await updateUser(user.id, { name: form.name });
        addToast('success', 'Member updated');
      } else {
        await createUser({ name: form.name, email: form.email, password: form.password, confirm_password: form.confirm_password });
        addToast('success', 'Member created');
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
      <FormField label="Full Name" error={errors.name} required>
        <FormInput value={form.name} onChange={set('name')} placeholder="Jane Austen" />
      </FormField>
      {!isEdit && (
        <>
          <FormField label="Email" error={errors.email} required>
            <FormInput type="email" value={form.email} onChange={set('email')} placeholder="jane@library.org" />
          </FormField>
          <FormField label="Password" error={errors.password} required>
            <FormInput type="password" value={form.password} onChange={set('password')} placeholder="Min 8 characters" />
          </FormField>
          <FormField label="Confirm Password" error={errors.confirm_password} required>
            <FormInput type="password" value={form.confirm_password} onChange={set('confirm_password')} placeholder="Repeat password" />
          </FormField>
        </>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Update Member' : 'Create Member'}
        </button>
      </div>
    </form>
  );
}
