import { useState } from 'react';
import { useProveedores } from '../../store/useProveedores';
import type { Proveedor } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const emptyForm = { ruc: '', razon_social: '', email: '', telefono: '', direccion: '' };

export default function ProveedoresPage() {
  const { proveedores, isLoading, crear, actualizar, eliminar } = useProveedores();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [deleting, setDeleting] = useState<Proveedor | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (item: Proveedor) => {
    setEditing(item);
    setForm({ ruc: item.ruc, razon_social: item.razon_social, email: item.email, telefono: item.telefono || '', direccion: item.direccion || '' });
    setModalOpen(true);
  };

  const openDelete = (item: Proveedor) => { setDeleting(item); setConfirmOpen(true); };

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
      key: 'ruc', 
      header: 'RUC', 
      sortable: true,
      render: (item: Proveedor) => (
        <span className="font-mono text-xs bg-background text-primary px-2.5 py-1 rounded-lg border border-border font-semibold">
          {item.ruc}
        </span>
      )
    },
    { 
      key: 'razon_social', 
      header: 'Razón Social', 
      sortable: true,
      render: (item: Proveedor) => <span className="text-card-foreground font-bold">{item.razon_social}</span> 
    },
    { 
      key: 'email', 
      header: 'Email', 
      sortable: true,
      render: (item: Proveedor) => <span className="text-accent font-medium">{item.email}</span> 
    },
    { 
      key: 'telefono', 
      header: 'Teléfono',
      render: (item: Proveedor) => <span className="text-muted-foreground">{item.telefono || '-'}</span> 
    },
    { 
      key: 'direccion', 
      header: 'Dirección',
      render: (item: Proveedor) => <span className="text-muted-foreground text-xs">{item.direccion || '-'}</span> 
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-card-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>Proveedores</h1>
          <p className="text-muted-foreground text-sm">Administra el directorio de contactos y empresas proveedoras.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-accent hover:bg-accent/80 text-white font-bold px-5 py-3 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={18} /> Nuevo Proveedor
        </Button>
      </div>

      {/* Tabla de Proveedores */}
      <div className="bg-card backdrop-blur-lg rounded-3xl border border-border p-6 shadow-2xl overflow-hidden">
        <DataTable 
          columns={columns} 
          data={proveedores} 
          loading={isLoading} 
          onEdit={openEdit} 
          onDelete={openDelete} 
          searchable 
          searchKeys={["nombre", "email", "telefono"]} 
        />
      </div>

      {/* Modal de Crear / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-muted-foreground p-1">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">RUC</label>
            <input 
              placeholder="Ej: 1790012345001" 
              value={form.ruc}
              onChange={e => setForm({ ...form, ruc: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-mono" 
              maxLength={13} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Razón Social</label>
            <input 
              placeholder="Ej: Constructora ABC Cía. Ltda." 
              value={form.razon_social}
              onChange={e => setForm({ ...form, razon_social: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Correo electrónico</label>
            <input 
              type="email" 
              placeholder="Ej: contacto@abc.com" 
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Teléfono</label>
            <input 
              placeholder="Ej: 0991234567" 
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Dirección</label>
            <input 
              placeholder="Ej: Av. Principal y 5 de Octubre" 
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setModalOpen(false)}
              className="bg-secondary hover:bg-black/10 dark:hover:bg-white/10 text-card-foreground border border-border px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={crear.isPending || actualizar.isPending}
              className="bg-accent hover:bg-accent/80 text-white font-bold px-6 py-2.5 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        title="Eliminar proveedor"
        message={`¿Estás seguro de eliminar al proveedor "${deleting?.razon_social}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending} 
      />
    </div>
  );
}