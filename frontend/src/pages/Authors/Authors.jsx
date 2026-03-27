import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAuthors } from '../../api/authors';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../hooks/useModal';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { AuthorForm } from '../../components/forms/AuthorForm';
import './Authors.css';

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const createModal = useModal();
  const editModal = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      createModal.open();
      setSearchParams({});
    }
  }, [searchParams]);

  const fetchAuthors = () => {
    setLoading(true);
    getAuthors()
      .then((res) => setAuthors(res.data))
      .catch(() => addToast('error', 'Failed to load authors'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAuthors(); }, []);

  const columns = [
    { key: 'name', label: 'Name', render: (a) => `${a.first_name} ${a.last_name}` },
    { key: 'nationality', label: 'Nationality' },
    { key: 'birth_date', label: 'Birth Date', render: (a) => new Date(a.birth_date + 'T00:00:00').toLocaleDateString() },
    { key: 'actions', label: '', width: '80px', render: (a) => (
      <button className="btn btn-outline btn-sm" onClick={() => editModal.open(a)}>Edit</button>
    )},
  ];

  return (
    <div className="page-container">
      <Table columns={columns} data={authors} loading={loading} emptyMessage="No authors yet. Add the first one!" />

      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="New Author">
        <AuthorForm onSuccess={() => { createModal.close(); fetchAuthors(); }} onCancel={createModal.close} />
      </Modal>

      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Author">
        {editModal.data && (
          <AuthorForm
            author={editModal.data}
            onSuccess={() => { editModal.close(); fetchAuthors(); }}
            onCancel={editModal.close}
          />
        )}
      </Modal>
    </div>
  );
}
