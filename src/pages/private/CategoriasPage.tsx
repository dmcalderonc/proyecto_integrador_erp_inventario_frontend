import { useState } from 'react';
import { useCategorias } from '../../store/useCategorias';
import type { Categoria } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const emptyForm = { nombre: '', prefijo: '' };

export default function CategoriasPage() {
  const { categorias, isLoading, crear, actualizar, eliminar } = useCategorias();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [deleting, setDeleting] = useState<Categoria | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (item: Categoria) => {
    setEditing(item);
    setForm({ nombre: item.nombre, prefijo: item.prefijo });
    setModalOpen(true);
  };

  const openDelete = (item: Categoria) => { setDeleting(item); setConfirmOpen(true); };

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
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      render: (item: Categoria) => <span className="text-text-primary font-bold">{item.nombre}</span>
    },
    {
      key: 'prefijo',
      header: 'Prefijo',
      sortable: true,
      render: (item: Categoria) => (
        <span className="font-mono text-xs bg-success-bg text-success px-2.5 py-1 rounded-lg border border-success/30 font-semibold">
          {item.prefijo}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Categorías</h1>
          <p className="text-sm text-text-secondary mt-1">Organiza y clasifica los materiales de tu inventario.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Nueva Categoría
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable columns={columns} data={categorias} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={["nombre", "prefijo"]} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Nombre</label>
            <input
              placeholder="Ej: Ferretería"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Prefijo</label>
            <input
              placeholder="Ej: FER"
              value={form.prefijo}
              onChange={e => setForm({ ...form, prefijo: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all uppercase font-mono"
              maxLength={10}
              required
            />
            <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              Máximo 10 caracteres. Se utiliza como prefijo para la generación de SKU.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
              {editing ? (actualizar.isPending ? 'Guardando...' : 'Actualizar') : (crear.isPending ? 'Creando...' : 'Crear')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar categoría"
        message={`¿Estás seguro de eliminar la categoría "${deleting?.nombre}"? Los materiales asociados podrían verse afectados.`}
        loading={eliminar.isPending}
      />
    </div>
  );
}
