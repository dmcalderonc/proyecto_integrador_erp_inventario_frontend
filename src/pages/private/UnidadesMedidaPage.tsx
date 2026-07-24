import { useState } from 'react';
import { useUnidadesMedida } from '../../store/useUnidadesMedida';
import type { UnidadMedida } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Power, PowerOff, Trash2 } from 'lucide-react';
import { getBadgeStyle } from '../../lib/design-tokens';

const emptyForm = { nombre: '', simbolo: '' };

export default function UnidadesMedidaPage() {
  const [showSuspended, setShowSuspended] = useState(false);
  const { unidades, isLoading, crear, actualizar, eliminar } = useUnidadesMedida(showSuspended);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<UnidadMedida | null>(null);
  const [deleting, setDeleting] = useState<UnidadMedida | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

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

  const handleToggleActive = async (item: UnidadMedida) => {
    await actualizar.mutateAsync({ id: item.id, dto: { isActive: !item.isActive } });
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
    {
      key: 'isActive',
      header: 'Estado',
      render: (item: UnidadMedida) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeStyle(item.isActive ? 'ACTIVO' : 'INACTIVO')}`}>
          {item.isActive ? 'Activa' : 'Suspendida'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (item: UnidadMedida) => (
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(item); setForm({ nombre: item.nombre, simbolo: item.simbolo }); setModalOpen(true); }}
            className="text-accent hover:text-accent/80 p-1.5 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
            title="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button
            onClick={() => handleToggleActive(item)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              item.isActive
                ? 'text-warning hover:text-warning/80 hover:bg-warning/10'
                : 'text-success hover:text-success/80 hover:bg-success/10'
            }`}
            title={item.isActive ? 'Suspender' : 'Activar'}
          >
            {item.isActive ? <PowerOff size={14} /> : <Power size={14} />}
          </button>
          <button
            onClick={() => { setDeleting(item); setConfirmOpen(true); }}
            className="text-danger hover:text-danger/80 p-1.5 rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
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
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowSuspended(false)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              !showSuspended ? 'bg-accent/10 text-accent border border-accent/30' : 'text-text-secondary hover:bg-elevated border border-transparent'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setShowSuspended(true)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              showSuspended ? 'bg-danger/10 text-danger border border-danger/30' : 'text-text-secondary hover:bg-elevated border border-transparent'
            }`}
          >
            Suspendidas
          </button>
        </div>
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
