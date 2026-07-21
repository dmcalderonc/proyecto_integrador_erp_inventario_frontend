import { useState } from 'react';
import { useUsers } from '../../store/useUsers';
import type { User, UserRole } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const ROLES = ['ADMIN', 'SOLICITANTE', 'BODEGUERO', 'COMPRADOR'] as const;

const emptyForm: { username: string; email: string; password: string; rol: UserRole; is_active: boolean } = {
  username: '', email: '', password: '', rol: 'SOLICITANTE', is_active: true,
};

export default function UsersPage() {
  const { users, isLoading, crear, actualizar, eliminar } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: User) => {
    setEditing(item);
    setForm({ username: item.nombre, email: item.email, password: '', rol: item.rol, is_active: !!item.estado });
    setModalOpen(true);
  };

  const openDelete = (item: User) => {
    setDeleting(item);
    setConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const dto: Record<string, unknown> = { username: form.username, email: form.email, rol: form.rol, is_active: form.is_active };
      if (form.password) dto.password = form.password;
      await actualizar.mutateAsync({ id: editing.id, dto });
    } else {
      await crear.mutateAsync({ username: form.username, email: form.email, password: form.password, rol: form.rol, is_active: form.is_active });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await eliminar.mutateAsync(deleting.id);
    setConfirmOpen(false);
    setDeleting(null);
  };

  const columns = [
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'rol', header: 'Rol', sortable: true, sortValue: (item: User) => item.rol,
      render: (item: User) => (
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {item.rol}
        </span>
      ),
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: User) => (
        <span className={item.estado ? 'text-green-600 font-medium' : 'text-gray-400'}>
          {item.estado ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="inline mr-1" /> Nuevo
        </Button>
      </div>

      <DataTable columns={columns} data={users} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={["nombre", "email", "rol"]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre de usuario</label>
            <input placeholder="Ej: Juan Pérez" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Correo electrónico</label>
            <input type="email" placeholder="Ej: usuario@mail.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Contraseña {editing && <span className="text-gray-400">(dejar vacío para no cambiar)</span>}
            </label>
            <input type="password" placeholder={editing ? '••••••' : 'Mínimo 6 caracteres'} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" minLength={6}
              {...(!editing && { required: true })} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Rol</label>
            <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value as UserRole })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="is_active" className="text-sm text-gray-600">Activo</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar al usuario "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending} />
    </div>
  );
}
