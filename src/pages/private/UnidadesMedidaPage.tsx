import { useState } from 'react';
import { useUnidadesMedida } from '../../store/useUnidadesMedida';
import type { UnidadMedida } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const emptyForm = { nombre: '', simbolo: '' };

export default function UnidadesMedidaPage() {
  const { unidades, isLoading, crear, actualizar, eliminar } = useUnidadesMedida();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<UnidadMedida | null>(null);
  const [deleting, setDeleting] = useState<UnidadMedida | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (item: UnidadMedida) => {
    setEditing(item);
    setForm({ nombre: item.nombre, simbolo: item.simbolo });
    setModalOpen(true);
  };

  const openDelete = (item: UnidadMedida) => { setDeleting(item); setConfirmOpen(true); };

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
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'simbolo', header: 'Símbolo', sortable: true },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Unidades de Medida</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="inline mr-1" /> Nueva
        </Button>
      </div>

      <DataTable columns={columns} data={unidades} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={["nombre", "simbolo"]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Unidad' : 'Nueva Unidad'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input placeholder="Ej: Kilogramo" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Símbolo</label>
            <input placeholder="Ej: KG" value={form.simbolo}
              onChange={e => setForm({ ...form, simbolo: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" maxLength={10} required />
            <p className="text-xs text-gray-400 mt-1">Máximo 10 caracteres.</p>
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
        title="Eliminar unidad de medida"
        message={`¿Estás seguro de eliminar la unidad "${deleting?.nombre}"? Si tiene materiales asociados, no se podrá eliminar.`}
        loading={eliminar.isPending} />
    </div>
  );
}
