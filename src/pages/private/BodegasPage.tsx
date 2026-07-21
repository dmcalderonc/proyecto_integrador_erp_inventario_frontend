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
      render: (item: Bodega) => <span className="text-[#FFFFFF] font-bold">{item.nombre}</span> 
    },
    { 
      key: 'ubicacion', 
      header: 'Ubicación', 
      sortable: true,
      render: (item: Bodega) => <span className="text-[#94A3B8]">{item.ubicacion}</span> 
    },
    {
      key: 'isPrincipal', 
      header: 'Principal', 
      sortable: true, 
      sortValue: (item: Bodega) => item.isPrincipal ? 'Sí' : 'No',
      render: (item: Bodega) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${
          item.isPrincipal 
            ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' 
            : 'bg-[#0A1128] text-[#94A3B8] border-[#334155]'
        }`}>
          {item.isPrincipal ? 'Sí' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FFFFFF] mb-2">Bodegas</h1>
          <p className="text-[#94A3B8] text-sm">Gestiona y administra las ubicaciones físicas de tu inventario.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-5 py-3 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={18} /> Nueva Bodega
        </Button>
      </div>

      {/* Tabla de Bodegas */}
      <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl overflow-hidden">
        <DataTable 
          columns={columns} 
          data={bodegas} 
          loading={isLoading} 
          onEdit={openEdit} 
          onDelete={openDelete} 
          searchable 
          searchKeys={["nombre", "ubicacion"]} 
        />
      </div>

      {/* Modal de Crear / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Bodega' : 'Nueva Bodega'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-[#94A3B8] p-1">
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Nombre</label>
            <input 
              placeholder="Ej: Bodega Central" 
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Ubicación</label>
            <input 
              placeholder="Ej: Quito, Ecuador" 
              value={form.ubicacion}
              onChange={e => setForm({ ...form, ubicacion: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" 
              required 
            />
          </div>

          <div className="flex items-center gap-3 bg-[#0A1128] p-3.5 rounded-2xl border border-[#334155]">
            <input 
              type="checkbox" 
              id="isPrincipal" 
              checked={form.isPrincipal}
              onChange={e => setForm({ ...form, isPrincipal: e.target.checked })}
              className="h-5 w-5 rounded-lg border-[#334155] bg-[#111D4A] text-[#10B981] focus:ring-[#10B981] focus:ring-offset-0 transition-all cursor-pointer" 
            />
            <label htmlFor="isPrincipal" className="text-sm font-medium text-[#FFFFFF] cursor-pointer">
              Bodega principal
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setModalOpen(false)}
              className="bg-[#1E293B] hover:bg-white/10 text-[#FFFFFF] border border-[#334155] px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={crear.isPending || actualizar.isPending}
              className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-6 py-2.5 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        title="Eliminar bodega"
        message={`¿Estás seguro de eliminar la bodega "${deleting?.nombre}"? El inventario asociado podría verse afectado.`}
        loading={eliminar.isPending} 
      />
    </div>
  );
}