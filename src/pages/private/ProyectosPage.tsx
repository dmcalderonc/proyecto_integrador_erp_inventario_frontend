import { useState } from 'react';
import { useProyectos } from '../../store/useProyectos';
import { useAuth } from '../../contexts/AuthContext';
import type { Proyecto, EstadoProyecto } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

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
      render: (item: Proyecto) => <span className="text-[#E2E8F0] font-semibold">{item.nombre}</span>
    },
    {
      key: 'codigoProyecto',
      header: 'Código',
      sortable: true,
      render: (item: Proyecto) => (
        <span className="font-mono text-xs bg-[#0A1128] text-[#10B981] px-2.5 py-1 rounded-lg border border-[#334155] font-semibold">
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
        <span className="text-[#94A3B8] font-medium">
          {item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: Proyecto) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${item.estado === 'ACTIVO'
            ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
            : 'bg-[#0A1128] text-[#94A3B8]/70 border-[#334155]'
          }`}>
          {item.estado}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#E2E8F0] mb-2">Proyectos</h1>
          <p className="text-[#94A3B8] text-sm">Gestiona obras, centros de costos y bodegas asociadas.</p>
        </div>
        {isAdmin && (
          <Button
            onClick={openCreate}
            className="bg-[#06B6D4] hover:bg-[#0284C7] text-slate-900 font-extrabold px-5 py-3 rounded-xl border border-[#06B6D4]/30 transition-all shadow-lg shadow-[#06B6D4]/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
          >
            <Plus size={18} /> Nuevo Proyecto
          </Button>
        )}
      </div>

      {/* Tabla de Proyectos (Tema oscuro sin blanco, con soporte para botones Editar/Eliminar) */}
      <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl overflow-hidden 
        text-[#CBD5E1] 
        [&_table]:text-[#CBD5E1] 
        [&_th]:text-[#94A3B8] [&_th]:font-bold [&_th]:bg-[#0A1128]/70 [&_th]:border-b [&_th]:border-[#334155] 
        [&_td]:text-[#E2E8F0] [&_td]:border-b [&_td]:border-[#334155]/50 
        [&_input]:text-[#E2E8F0] [&_input]:bg-[#0A1128] [&_input]:border-[#334155] [&_input]:placeholder-[#94A3B8]/50 
        
        {/* Estilos para botón Editar (Azul / Cian) */}
        [&_button[data-action='edit']]:bg-[#06B6D4]/10 
        [&_button[data-action='edit']]:text-[#06B6D4] 
        [&_button[data-action='edit']]:border 
        [&_button[data-action='edit']]:border-[#06B6D4]/30 
        [&_button[data-action='edit']]:hover:bg-[#06B6D4]/20 
        
        {/* Estilos para botón Eliminar (Rojo) */}
        [&_button[data-action='delete']]:bg-red-500/10 
        [&_button[data-action='delete']]:text-red-400 
        [&_button[data-action='delete']]:border 
        [&_button[data-action='delete']]:border-red-500/30 
        [&_button[data-action='delete']]:hover:bg-red-500/20">
        
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

      {/* Modal de Crear / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-[#94A3B8] p-1">
          <div>
            <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Nombre</label>
            <input
              placeholder="Ej: Construcción Torre Norte"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-[#0A1128] text-[#E2E8F0] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Código de proyecto (opcional)</label>
            <input
              placeholder="Ej: PROY-2026-001 (Automático si se deja vacío)"
              value={form.codigoProyecto}
              onChange={e => setForm({ ...form, codigoProyecto: e.target.value })}
              className="w-full bg-[#0A1128] text-[#E2E8F0] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Fecha de inicio</label>
            <input
              type="date"
              value={form.fechaInicio}
              onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
              className="w-full bg-[#0A1128] text-[#E2E8F0] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all cursor-pointer [color-scheme:dark]"
              required
            />
          </div>

          {editing && (
            <div>
              <label className="block text-sm font-medium text-[#E2E8F0] mb-1.5">Estado</label>
              <select
                value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value as EstadoProyecto })}
                className="w-full bg-[#0A1128] text-[#E2E8F0] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all cursor-pointer"
              >
                <option value="ACTIVO" className="bg-[#0A1128]">ACTIVO</option>
                <option value="CERRADO" className="bg-[#0A1128]">CERRADO</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              className="bg-[#1E293B] hover:bg-slate-800 text-[#CBD5E1] border border-[#334155] px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={crear.isPending || actualizar.isPending}
              className="bg-[#06B6D4] hover:bg-[#0284C7] text-slate-900 font-extrabold px-6 py-2.5 rounded-xl border border-[#06B6D4]/30 transition-all shadow-lg shadow-[#06B6D4]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {editing ? (actualizar.isPending ? 'Guardando...' : 'Actualizar') : (crear.isPending ? 'Creando...' : 'Crear')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación de Eliminación */}
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