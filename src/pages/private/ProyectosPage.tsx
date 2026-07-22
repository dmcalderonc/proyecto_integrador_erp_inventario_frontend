import { useState } from 'react';
import { useProyectos } from '../../store/useProyectos';
import { useAuth } from '../../contexts/AuthContext';
import type { Proyecto, EstadoProyecto } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';

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
      render: (item: Proyecto) => (
        <span className="font-bold text-[#303357]">{item.nombre}</span>
      )
    },
    {
      key: 'codigoProyecto',
      header: 'Código',
      sortable: true,
      render: (item: Proyecto) => (
        <span className="font-mono text-xs text-[#303357] px-2.5 py-1 rounded-lg border border-[#303357]/30 font-bold">
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
        <span className="font-semibold text-[#303357]">
          {item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: Proyecto) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${item.estado === 'ACTIVO'
            ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50'
            : 'bg-red-500/20 text-red-400 border-red-500/40'
          }`}>
          {item.estado}
        </span>
      ),
    },
    ...(isAdmin ? [{
      key: 'acciones',
      header: 'Acciones',
      render: (item: Proyecto) => (
        <div className="flex items-center gap-2">
          {/* Botón Editar - Azul */}
          <button
            onClick={() => openEdit(item)}
            className="flex items-center gap-1 bg-[#06B6D4]/20 text-[#06B6D4] hover:bg-[#06B6D4] hover:text-white px-3 py-1.5 rounded-lg border border-[#06B6D4]/50 transition-all font-bold text-xs cursor-pointer"
          >
            <Edit2 size={14} /> Editar
          </button>
          {/* Botón Eliminar - Rojo */}
          <button
            onClick={() => openDelete(item)}
            className="flex items-center gap-1 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg border border-red-500/50 transition-all font-bold text-xs cursor-pointer"
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      )
    }] : [])
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FFFFFF] mb-2">Proyectos</h1>
          <p className="text-[#94A3B8] text-sm">Gestiona obras, centros de costos y bodegas asociadas.</p>
        </div>
        {isAdmin && (
          <Button
            onClick={openCreate}
            className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-extrabold px-5 py-3 rounded-xl border border-[#06B6D4] transition-all shadow-lg shadow-[#06B6D4]/30 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
          >
            <Plus size={18} /> Nuevo Proyecto
          </Button>
        )}
      </div>

      {/* Tabla con letras en color #303357 */}
      <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl overflow-hidden
        text-[#303357]
        [&_table]:w-full [&_table]:text-[#303357]
        [&_th]:text-[#303357] [&_th]:font-extrabold [&_th]:bg-[#0A1128] [&_th]:border-b [&_th]:border-[#334155] [&_th]:p-4
        [&_td]:text-[#303357] [&_td]:border-b [&_td]:border-[#334155]/60 [&_td]:p-4
        [&_input]:text-[#303357] [&_input]:bg-[#0A1128] [&_input]:border-[#334155] [&_input]:placeholder-[#303357]/60 [&_input]:font-semibold">
        
        <DataTable
          columns={columns}
          data={proyectos}
          loading={isLoading}
          searchable
          searchKeys={["nombre", "estado"]}
        />
      </div>

      {/* Modal de Crear / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
        <form onSubmit={handleSubmit} className="space-y-5 p-1">
          <div>
            <label className="block text-sm font-bold text-[#FFFFFF] mb-1.5">Nombre</label>
            <input
              placeholder="Ej: Construcción Torre Norte"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#FFFFFF] mb-1.5">Código de proyecto (opcional)</label>
            <input
              placeholder="Ej: PROY-2026-001 (Automático si se deja vacío)"
              value={form.codigoProyecto}
              onChange={e => setForm({ ...form, codigoProyecto: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all font-mono font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#FFFFFF] mb-1.5">Fecha de inicio</label>
            <input
              type="date"
              value={form.fechaInicio}
              onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all cursor-pointer font-semibold [color-scheme:dark]"
              required
            />
          </div>

          {editing && (
            <div>
              <label className="block text-sm font-bold text-[#FFFFFF] mb-1.5">Estado</label>
              <select
                value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value as EstadoProyecto })}
                className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all cursor-pointer font-semibold"
              >
                <option value="ACTIVO" className="bg-[#0A1128] text-[#10B981]">ACTIVO</option>
                <option value="CERRADO" className="bg-[#0A1128] text-red-400">CERRADO</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              className="bg-[#1E293B] hover:bg-slate-800 text-[#FFFFFF] border border-[#334155] px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={crear.isPending || actualizar.isPending}
              className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-extrabold px-6 py-2.5 rounded-xl border border-[#06B6D4] transition-all shadow-lg shadow-[#06B6D4]/20 disabled:opacity-50 cursor-pointer"
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