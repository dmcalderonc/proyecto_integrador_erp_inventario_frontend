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
      render: (item: UnidadMedida) => <span className="text-[#303357] font-bold">{item.nombre}</span>
    },
    { 
      key: 'simbolo', 
      header: 'Símbolo', 
      sortable: true,
      render: (item: UnidadMedida) => (
        <span className="font-mono text-xs bg-[#0A1128] text-[#06B6D4] px-3 py-1 rounded-xl border border-[#334155] font-semibold">
          {item.simbolo}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FFFFFF] mb-2">Unidades de Medida</h1>
          <p className="text-[#94A3B8] text-sm">Gestiona las unidades para la métrica e inventario de materiales.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-5 py-3 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={18} /> Nueva Unidad
        </Button>
      </div>

      {/* Tabla de Unidades de Medida */}
      <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl overflow-hidden">
        <DataTable 
          columns={columns} 
          data={unidades} 
          loading={isLoading} 
          onEdit={openEdit} 
          onDelete={openDelete} 
          searchable 
          searchKeys={["nombre", "simbolo"]} 
        />
      </div>

      {/* Modal de Crear / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Unidad' : 'Nueva Unidad'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-[#94A3B8] p-1">
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Nombre</label>
            <input 
              placeholder="Ej: Kilogramo" 
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Símbolo</label>
            <input 
              placeholder="Ej: KG" 
              value={form.simbolo}
              onChange={e => setForm({ ...form, simbolo: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all uppercase font-mono" 
              maxLength={10} 
              required 
            />
            <p className="text-xs text-[#94A3B8]/80 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></span>
              Máximo 10 caracteres.
            </p>
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
        title="Eliminar unidad de medida"
        message={`¿Estás seguro de eliminar la unidad "${deleting?.nombre}"? Si tiene materiales asociados, no se podrá eliminar.`}
        loading={eliminar.isPending} 
      />
    </div>
  );
}