import { useState } from 'react';
import { useUsers } from '../../store/useUsers';
import type { User, UserRole } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const ROLES = ['ADMIN', 'SOLICITANTE', 'BODEGUERO', 'COMPRADOR'] as const;

const rolColors: Record<string, string> = {
  ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  BODEGUERO: 'bg-accent/10 text-accent border-accent/30',
  COMPRADOR: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  SOLICITANTE: 'bg-primary/10 text-primary border-primary/30',
};

const emptyForm: { username: string; email: string; password: string; rol: UserRole; is_active: boolean } = {
  username: '', email: '', password: '', rol: 'SOLICITANTE', is_active: true,
};

export default function UsersPage() {
  const { users, isLoading, crear, actualizar, eliminar } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: User) => {
    setEditing(item);
    setForm({ username: item.nombre, email: item.email, password: '', rol: item.rol, is_active: !!item.estado });
    setModalOpen(true);
  };

  const openDelete = (item: User) => {
    setDeleting(item);
    setConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const dto: Record<string, unknown> = { username: form.username, email: form.email, rol: form.rol, is_active: form.is_active };
      if (form.password) dto.password = form.password;
      await actualizar.mutateAsync({ id: editing.id, dto });
    } else {
      await crear.mutateAsync({ username: form.username, email: form.email, password: form.password, rol: form.rol, is_active: form.is_active });
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
      render: (item: User) => <span className="text-card-foreground font-bold">{item.nombre}</span> 
    },
    { 
      key: 'email', 
      header: 'Email', 
      sortable: true,
      render: (item: User) => <span className="text-accent font-medium">{item.email}</span> 
    },
    {
      key: 'rol', 
      header: 'Rol', 
      sortable: true, 
      sortValue: (item: User) => item.rol,
      render: (item: User) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${rolColors[item.rol] || 'bg-background text-muted-foreground border-border'}`}>
          {item.rol}
        </span>
      ),
    },
    {
      key: 'estado', 
      header: 'Estado',
      render: (item: User) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${
          item.estado 
            ? 'bg-primary/10 text-primary border-primary/30' 
            : 'bg-background text-muted-foreground/60 border-border'
        }`}>
          {item.estado ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-card-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>Usuarios</h1>
          <p className="text-muted-foreground text-sm">Gestiona accesos, roles y credenciales de usuario del sistema.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-accent hover:bg-accent/80 text-white font-bold px-5 py-3 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={18} /> Nuevo Usuario
        </Button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-card backdrop-blur-lg rounded-3xl border border-border p-6 shadow-2xl overflow-hidden">
        <DataTable columns={columns} data={users} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={["nombre", "email", "rol"]} />
      </div>

      {/* Modal de Crear / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-muted-foreground p-1">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Nombre de usuario</label>
            <input 
              placeholder="Ej: Juan Pérez" 
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Correo electrónico</label>
            <input 
              type="email" 
              placeholder="Ej: usuario@mail.com" 
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">
              Contraseña {editing && <span className="text-muted-foreground/60 font-normal">(dejar vacío para mantener la actual)</span>}
            </label>
            <input 
              type="password" 
              placeholder={editing ? '••••••••' : 'Mínimo 6 caracteres'} 
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
              minLength={6}
              {...(!editing && { required: true })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Rol</label>
            <select 
              value={form.rol} 
              onChange={e => setForm({ ...form, rol: e.target.value as UserRole })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer font-semibold"
            >
              {ROLES.map(r => <option key={r} value={r} className="bg-background">{r}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-background p-3.5 rounded-2xl border border-border">
            <input 
              type="checkbox" 
              id="is_active" 
              checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
              className="h-5 w-5 rounded-lg border-border bg-card text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer" 
            />
            <label htmlFor="is_active" className="text-sm font-medium text-card-foreground cursor-pointer">
              Usuario activo
            </label>
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
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar al usuario "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending} 
      />
    </div>
  );
}