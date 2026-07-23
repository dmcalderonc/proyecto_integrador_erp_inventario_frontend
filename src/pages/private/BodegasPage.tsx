import { useState } from 'react';
import { useBodegas } from '../../store/useBodegas';
import type { Bodega } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const emptyForm = { nombre: '', ubicacion: '', isPrincipal: false };

export default function BodegasPage() {
  const { bodegas, isLoading, crear, actualizar, eliminar } = useBodegas();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Bodega | null>(null);
  const [deleting, setDeleting] = useState<Bodega | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (item: Bodega) => {
    setEditing(item);
    setForm({ nombre: item.nombre, ubicacion: item.ubicacion, isPrincipal: item.isPrincipal });
    setModalOpen(true);
  };

  const openDelete = (item: Bodega) => { setDeleting(item); setConfirmOpen(true); };

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
      render: (item: Bodega) => <span className="text-text-primary font-bold">{item.nombre}</span>
    },
    {
      key: 'ubicacion',
      header: 'Ubicación',
      sortable: true,
      render: (item: Bodega) => <span className="text-text-secondary">{item.ubicacion}</span>
    },
    {
      key: 'isPrincipal',
      header: 'Principal',
      sortable: true,
      sortValue: (item: Bodega) => item.isPrincipal ? 'Sí' : 'No',
      render: (item: Bodega) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
          item.isPrincipal
            ? 'bg-success-bg text-success border-success/30'
            : 'bg-elevated text-text-muted border-border-default'
        }`}>
          {item.isPrincipal ? 'Sí' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Bodegas</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona y administra las ubicaciones físicas de tu inventario.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Nueva Bodega
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable columns={columns} data={bodegas} loading={isLoading} searchable searchKeys={["nombre", "ubicacion"]} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Bodega' : 'Nueva Bodega'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Nombre</label>
            <input
              placeholder="Ej: Bodega Central"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Ubicación</label>
            <input
              placeholder="Ej: Quito, Ecuador"
              value={form.ubicacion}
              onChange={e => setForm({ ...form, ubicacion: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          <div className="flex items-center gap-3 bg-base p-3.5 rounded-xl border border-border-subtle">
            <input
              type="checkbox"
              id="isPrincipal"
              checked={form.isPrincipal}
              onChange={e => setForm({ ...form, isPrincipal: e.target.checked })}
              className="h-5 w-5 rounded-lg border-border-default bg-elevated text-success focus:ring-success/30 focus:ring-offset-0 transition-all cursor-pointer"
            />
            <label htmlFor="isPrincipal" className="text-sm font-medium text-text-primary cursor-pointer">
              Bodega principal
            </label>
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
        title="Eliminar bodega"
        message={`¿Estás seguro de eliminar la bodega "${deleting?.nombre}"? El inventario asociado podría verse afectado.`}
        loading={eliminar.isPending}
      />
    </div>
  );
}
