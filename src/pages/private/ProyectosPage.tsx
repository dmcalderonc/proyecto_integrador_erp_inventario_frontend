import React, { useState } from 'react';
import { useProyectos } from '../../store/useProyectos';
import { useAuth } from '../../contexts/AuthContext';
import type { Proyecto, EstadoProyecto } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';
import { getBadgeStyle } from '../../lib/design-tokens';

const emptyForm = { nombre: '', codigoProyecto: '', fechaInicio: '', estado: 'ACTIVO' as EstadoProyecto };

export default function ProyectosPage() {
  const { proyectos, isLoading, crear, actualizar, eliminar } = useProyectos();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN']);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Proyecto | null>(null);
  const [deleting, setDeleting] = useState<Proyecto | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (item: Proyecto) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      codigoProyecto: item.codigoProyecto ?? '',
      fechaInicio: item.fechaInicio ? item.fechaInicio.slice(0, 10) : '',
      estado: item.estado,
    });
    setModalOpen(true);
  };

  const openDelete = (item: Proyecto) => { setDeleting(item); setConfirmOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editing) {
      await actualizar.mutateAsync({
        id: editing.id,
        dto: {
          nombre: form.nombre,
          fechaInicio: form.fechaInicio,
          estado: form.estado,
          ...(form.codigoProyecto ? { codigoProyecto: form.codigoProyecto } : {}),
        },
      });
    } else {
      await crear.mutateAsync({
        nombre: form.nombre,
        fechaInicio: form.fechaInicio,
        ...(form.codigoProyecto ? { codigoProyecto: form.codigoProyecto } : {}),
      });
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
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      render: (item: Proyecto) => <span className="text-text-primary font-bold">{item.nombre}</span>
    },
    {
      key: 'codigoProyecto',
      header: 'Código',
      sortable: true,
      render: (item: Proyecto) => (
        <span className="font-mono text-xs bg-success-bg text-success px-2.5 py-1 rounded-lg border border-success/20 font-semibold">
          {item.codigoProyecto || '-'}
        </span>
      )
    },
    {
      key: 'fechaInicio',
      header: 'Fecha de inicio',
      sortable: true,
      sortValue: (item: Proyecto) => item.fechaInicio ?? '',
      render: (item: Proyecto) => (
        <span className="text-text-secondary">
          {item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: Proyecto) => (
        <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-semibold border ${getBadgeStyle(item.estado)}`}>
          {item.estado}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Proyectos</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona obras, centros de costos y bodegas asociadas.</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} className="gap-1.5">
            <Plus size={16} /> Nuevo Proyecto
          </Button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable
          columns={columns}
          data={proyectos}
          loading={isLoading}
          onEdit={isAdmin ? openEdit : undefined}
          onDelete={isAdmin ? openDelete : undefined}
          searchable
          searchKeys={["nombre", "estado"]}
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Nombre</label>
            <input
              placeholder="Ej: Construcción Torre Norte"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Código de proyecto (opcional)</label>
            <input
              placeholder="Ej: PROY-2026-001"
              value={form.codigoProyecto}
              onChange={e => setForm({ ...form, codigoProyecto: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Fecha de inicio</label>
            <input
              type="date"
              value={form.fechaInicio}
              onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer [color-scheme:dark]"
              required
            />
          </div>

          {editing && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Estado</label>
              <select
                value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value as EstadoProyecto })}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="CERRADO">CERRADO</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending} loading={crear.isPending || actualizar.isPending}>
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar proyecto"
        message={`¿Estás seguro de eliminar el proyecto "${deleting?.nombre}"? Se eliminará también la bodega de obra asociada.`}
        loading={eliminar.isPending}
      />
    </div>
  );
}
