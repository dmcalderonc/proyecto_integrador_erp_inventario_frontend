import { useState } from 'react';
import { useUsers } from '../../store/useUsers';
import { useBodegas } from '../../store/useBodegas';
import { useAuth } from '../../contexts/AuthContext';
import type { User, UserRole } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Shield } from 'lucide-react';
import { getBadgeStyle } from '../../lib/design-tokens';
import toast from 'react-hot-toast';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'COMPRADOR', label: 'Compras' },
  { value: 'BODEGUERO', label: 'Bodeguero' },
  { value: 'SOLICITANTE', label: 'Solicitante' },
];

interface FormState {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  estado: boolean;
  bodegaAsignadaId: number;
}

const emptyForm: FormState = {
  nombre: '',
  email: '',
  password: '',
  rol: 'SOLICITANTE',
  estado: true,
  bodegaAsignadaId: 0,
};

export default function UsersPage() {
  const { users, isLoading, crear, actualizar, eliminar } = useUsers();
  const { bodegas } = useBodegas();
  const { user: currentUser, refreshUser } = useAuth();
  const bodegaList = bodegas || [];
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: User) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      email: item.email,
      password: '',
      rol: item.rol,
      estado: !!item.estado,
      bodegaAsignadaId: item.bodegaAsignadaId ?? 0,
    });
    setModalOpen(true);
  };

  const openDelete = (item: User) => {
    setDeleting(item);
    setConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.rol === 'BODEGUERO' && (!form.bodegaAsignadaId || form.bodegaAsignadaId === 0)) {
      toast.error('Debes seleccionar una bodega para el rol Bodeguero');
      return;
    }

    if (editing) {
      const dto: Record<string, unknown> = {
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
        estado: form.estado,
      };
      if (form.password) dto.password = form.password;
      if (form.rol === 'BODEGUERO') {
        dto.bodegaAsignadaId = form.bodegaAsignadaId;
      } else {
        dto.bodegaAsignadaId = null;
      }

      const response = await actualizar.mutateAsync({ id: editing.id, dto: dto as any });
      const data = response?.data;

      if (data && currentUser && editing.id === currentUser.id && data.token) {
        refreshUser(data.token);
        toast.success('Tu rol ha cambiado. Los permisos se han actualizado.');
      } else {
        toast.success('Usuario actualizado exitosamente');
      }
    } else {
      const payload: Record<string, unknown> = {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        rol: form.rol,
      };
      if (form.rol === 'BODEGUERO') {
        payload.bodegaAsignadaId = form.bodegaAsignadaId;
      }
      await crear.mutateAsync(payload as any);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    if (deleting.id === currentUser?.id) {
      toast.error('No puedes eliminar tu propia cuenta');
      setConfirmOpen(false);
      setDeleting(null);
      return;
    }
    await eliminar.mutateAsync(deleting.id);
    setConfirmOpen(false);
    setDeleting(null);
  };

  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      render: (item: User) => <span className="text-text-primary font-bold">{item.nombre}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (item: User) => <span className="text-accent font-medium">{item.email}</span>,
    },
    {
      key: 'rol',
      header: 'Rol',
      sortable: true,
      sortValue: (item: User) => item.rol,
      render: (item: User) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeStyle(item.rol)}`}>
          {item.rol === 'ADMIN' && <Shield size={12} />}
          {item.rol}
        </span>
      ),
    },
    {
      key: 'bodegaAsignada',
      header: 'Bodega',
      render: (item: User) => (
        <span className="text-xs text-text-secondary">
          {item.rol === 'BODEGUERO' ? (item.bodegaAsignada?.nombre || `ID: ${item.bodegaAsignadaId}`) : '—'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: User) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeStyle(item.estado ? 'ACTIVO' : 'INACTIVO')}`}>
          {item.estado ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Usuarios</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona accesos, roles y credenciales de usuario del sistema.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Nuevo Usuario
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable columns={columns} data={users} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={['nombre', 'email', 'rol']} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Nombre</label>
            <input
              placeholder="Ej: Juan Pérez"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Correo electrónico</label>
            <input
              type="email"
              placeholder="Ej: usuario@mail.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Contraseña {editing && <span className="text-text-muted font-normal">(dejar vacío para mantener la actual)</span>}
            </label>
            <input
              type="password"
              placeholder={editing ? '••••••••' : 'Mínimo 6 caracteres'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              minLength={6}
              {...(!editing && { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Rol</label>
            <select
              value={form.rol}
              onChange={e => {
                const newRol = e.target.value as UserRole;
                setForm(f => ({
                  ...f,
                  rol: newRol,
                  bodegaAsignadaId: newRol !== 'BODEGUERO' ? 0 : f.bodegaAsignadaId,
                }));
              }}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer"
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {form.rol === 'BODEGUERO' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-text-primary mb-1.5">Bodega Asignada *</label>
              <select
                value={form.bodegaAsignadaId}
                onChange={e => setForm(f => ({ ...f, bodegaAsignadaId: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                required
              >
                <option value={0}>Seleccionar bodega</option>
                {bodegaList.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
              <p className="text-xs text-text-muted mt-1.5">El bodeguero solo gestionará el inventario de esta bodega.</p>
            </div>
          )}

          <div className="flex items-center gap-3 bg-base p-3.5 rounded-xl border border-border-subtle">
            <input
              type="checkbox"
              id="estado"
              checked={form.estado}
              onChange={e => setForm(f => ({ ...f, estado: e.target.checked }))}
              className="h-5 w-5 rounded-lg border-border-default bg-elevated text-success focus:ring-success/30 focus:ring-offset-0 transition-all cursor-pointer"
            />
            <label htmlFor="estado" className="text-sm font-medium text-text-primary cursor-pointer">
              Usuario activo
            </label>
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
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar al usuario "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending}
      />
    </div>
  );
}
