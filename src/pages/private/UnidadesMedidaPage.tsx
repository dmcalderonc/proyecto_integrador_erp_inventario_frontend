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
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      render: (item: UnidadMedida) => <span className="text-text-primary font-bold">{item.nombre}</span>
    },
    {
      key: 'simbolo',
      header: 'Símbolo',
      sortable: true,
      render: (item: UnidadMedida) => (
        <span className="font-mono text-xs bg-info-bg text-info px-2.5 py-1 rounded-lg border border-info/30 font-semibold">
          {item.simbolo}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Unidades de Medida</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona las unidades para la métrica e inventario de materiales.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Nueva Unidad
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable columns={columns} data={unidades} loading={isLoading} searchable searchKeys={["nombre", "simbolo"]} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Unidad' : 'Nueva Unidad'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Nombre</label>
            <input
              placeholder="Ej: Kilogramo"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Símbolo</label>
            <input
              placeholder="Ej: KG"
              value={form.simbolo}
              onChange={e => setForm({ ...form, simbolo: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all uppercase font-mono"
              maxLength={10}
              required
            />
            <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-info"></span>
              Máximo 10 caracteres.
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
        title="Eliminar unidad de medida"
        message={`¿Estás seguro de eliminar la unidad "${deleting?.nombre}"? Si tiene materiales asociados, no se podrá eliminar.`}
        loading={eliminar.isPending}
      />
    </div>
  );
}
