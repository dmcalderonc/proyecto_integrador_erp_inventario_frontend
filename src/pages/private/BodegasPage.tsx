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
      render: (item: Bodega) => <span className="text-card-foreground font-bold">{item.nombre}</span> 
    },
    { 
      key: 'ubicacion', 
      header: 'Ubicación', 
      sortable: true,
      render: (item: Bodega) => <span className="text-muted-foreground">{item.ubicacion}</span> 
    },
    {
      key: 'isPrincipal', 
      header: 'Principal', 
      sortable: true, 
      sortValue: (item: Bodega) => item.isPrincipal ? 'Sí' : 'No',
      render: (item: Bodega) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${
          item.isPrincipal 
            ? 'bg-primary/10 text-primary border-primary/30' 
            : 'bg-background text-muted-foreground border-border'
        }`}>
          {item.isPrincipal ? 'Sí' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-card-foreground dark:text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>Bodegas</h1>
          <p className="text-muted-foreground text-sm">Gestiona y administra las ubicaciones físicas de tu inventario.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-accent hover:bg-accent/80 text-primary-foreground font-bold px-5 py-3 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={18} /> Nueva Bodega
        </Button>
      </div>

      {/* Tabla de Bodegas */}
      <div className="bg-card backdrop-blur-lg rounded-3xl border border-border p-6 shadow-2xl overflow-hidden">
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
        <form onSubmit={handleSubmit} className="space-y-5 text-muted-foreground p-1">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Nombre</label>
            <input 
              placeholder="Ej: Bodega Central" 
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Ubicación</label>
            <input 
              placeholder="Ej: Quito, Ecuador" 
              value={form.ubicacion}
              onChange={e => setForm({ ...form, ubicacion: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
              required 
            />
          </div>

          <div className="flex items-center gap-3 bg-background p-3.5 rounded-2xl border border-border">
            <input 
              type="checkbox" 
              id="isPrincipal" 
              checked={form.isPrincipal}
              onChange={e => setForm({ ...form, isPrincipal: e.target.checked })}
              className="h-5 w-5 rounded-lg border-border bg-card text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer" 
            />
            <label htmlFor="isPrincipal" className="text-sm font-medium text-card-foreground cursor-pointer">
              Bodega principal
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setModalOpen(false)}
              className="bg-secondary hover:bg-black/10 dark:hover:bg-white/10 text-card-foreground dark:text-white border border-border px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={crear.isPending || actualizar.isPending}
              className="bg-accent hover:bg-accent/80 text-primary-foreground font-bold px-6 py-2.5 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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