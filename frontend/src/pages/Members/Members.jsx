import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUsers, deleteUser } from '../../api/users';
import { useToast } from '../../context/ToastContext';
import { useModal } from '../../hooks/useModal';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { UserForm } from '../../components/forms/UserForm';
import './Members.css';

export default function Members() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const createModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();
  const [deleting, setDeleting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      createModal.open();
      setSearchParams({});
    }
  }, [searchParams]);

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then((res) => setUsers(res.data))
      .catch(() => addToast('error', 'Failed to load members'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(deleteModal.data.id);
      addToast('success', 'Member deleted');
      deleteModal.close();
      fetchUsers();
    } catch (err) {
      addToast('error', err.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', render: (u) => (
      <Badge variant={u.is_active ? 'active' : 'inactive'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
    )},
    { key: 'actions', label: '', width: '140px', render: (u) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn btn-outline btn-sm" onClick={() => editModal.open(u)}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={() => deleteModal.open(u)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <Table columns={columns} data={users} loading={loading} emptyMessage="No members yet. Add the first one!" />

      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="New Member">
        <UserForm onSuccess={() => { createModal.close(); fetchUsers(); }} onCancel={createModal.close} />
      </Modal>

      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Member">
        {editModal.data && (
          <UserForm
            user={editModal.data}
            onSuccess={() => { editModal.close(); fetchUsers(); }}
            onCancel={editModal.close}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Delete Member"
        message={deleteModal.data ? `Are you sure you want to delete "${deleteModal.data.name}"? Members with active loans cannot be deleted.` : ''}
        loading={deleting}
      />
    </div>
  );
}
