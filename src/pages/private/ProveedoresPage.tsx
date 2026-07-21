import { useState } from 'react';
import { useProveedores } from '../../store/useProveedores';
import type { Proveedor } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const emptyForm = { ruc: '', razon_social: '', email: '', telefono: '', direccion: '' };

export default function ProveedoresPage() {
  const { proveedores, isLoading, crear, actualizar, eliminar } = useProveedores();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [deleting, setDeleting] = useState<Proveedor | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (item: Proveedor) => {
    setEditing(item);
    setForm({ ruc: item.ruc, razon_social: item.razon_social, email: item.email, telefono: item.telefono || '', direccion: item.direccion || '' });
    setModalOpen(true);
  };

  const openDelete = (item: Proveedor) => { setDeleting(item); setConfirmOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { await actualizar.mutateAsync({ id: editing.id, dto: form }); }
    else { await crear.mutateAsync(form); }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await eliminar.mutateAsync(deleting.id);
    setConfirmOpen(false);
    setDeleting(null);
  };

  const columns = [
    { key: 'ruc', header: 'RUC', sortable: true },
    { key: 'razon_social', header: 'Razón Social', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'direccion', header: 'Dirección' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="inline mr-1" /> Nuevo
        </Button>
      </div>

      <DataTable columns={columns} data={proveedores} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={["nombre", "email", "telefono"]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">RUC</label>
            <input placeholder="Ej: 1790012345001" value={form.ruc}
              onChange={e => setForm({ ...form, ruc: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" maxLength={13} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Razón Social</label>
            <input placeholder="Ej: Constructora ABC Cía. Ltda." value={form.razon_social}
              onChange={e => setForm({ ...form, razon_social: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Correo electrónico</label>
            <input type="email" placeholder="Ej: contacto@abc.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
            <input placeholder="Ej: 0991234567" value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Dirección</label>
            <input placeholder="Ej: Av. Principal y 5 de Octubre" value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
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
        title="Eliminar proveedor"
        message={`¿Estás seguro de eliminar al proveedor "${deleting?.razon_social}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending} />
    </div>
  );
}
