import { useState, useMemo } from 'react';
import { useUsers } from '../../store/useUsers';
import { useBodegas } from '../../store/useBodegas';
import { useAuth } from '../../contexts/AuthContext';
import type { User, UserRole } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Shield, Power, PowerOff, Trash2 } from 'lucide-react';
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
  isActive: boolean;
  bodegaIds: number[];
}

const emptyForm: FormState = {
  nombre: '',
  email: '',
  password: '',
  rol: 'SOLICITANTE',
  estado: true,
  isActive: true,
  bodegaIds: [],
};

export default function UsersPage() {
  const { users, isLoading, crear, actualizar, eliminar } = useUsers();
  const { bodegas } = useBodegas();
  const { user: currentUser, refreshUser } = useAuth();
  const bodegaList = bodegas || [];
  const [showSuspended, setShowSuspended] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filteredUsers = useMemo(() => {
    return users.filter((u: User) => showSuspended ? u.isActive === false : u.isActive !== false);
  }, [users, showSuspended]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.rol === 'BODEGUERO' && form.bodegaIds.length === 0) {
      toast.error('Debes seleccionar al menos una bodega para el rol Bodeguero');
      return;
    }

    if (editing) {
      const dto: Record<string, unknown> = {
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
        estado: form.estado,
        isActive: form.isActive,
        bodegaIds: form.rol === 'BODEGUERO' ? form.bodegaIds : [],
      };
      if (form.password) dto.password = form.password;

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
        bodegaIds: form.rol === 'BODEGUERO' ? form.bodegaIds : [],
      };
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

  const handleToggleActive = async (item: User) => {
    if (item.id === currentUser?.id) {
      toast.error('No puedes suspender tu propia cuenta');
      return;
    }
    await actualizar.mutateAsync({ id: item.id, dto: { isActive: !item.isActive } });
  };

  const toggleBodega = (bodegaId: number) => {
    setForm(f => {
      const exists = f.bodegaIds.includes(bodegaId);
      return {
        ...f,
        bodegaIds: exists
          ? f.bodegaIds.filter(id => id !== bodegaId)
          : [...f.bodegaIds, bodegaId],
      };
    });
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
      key: 'bodegasAsignadas',
      header: 'Bodegas',
      render: (item: User) => (
        <span className="text-xs text-text-secondary">
          {item.rol === 'BODEGUERO'
            ? (item.bodegasAsignadas && item.bodegasAsignadas.length > 0
              ? item.bodegasAsignadas.map(b => b.nombre).join(', ')
              : 'Sin bodega')
            : '—'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (item: User) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeStyle(item.isActive !== false ? 'ACTIVO' : 'INACTIVO')}`}>
          {item.isActive !== false ? 'Activo' : 'Suspendido'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (item: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(item); setForm({ nombre: item.nombre, email: item.email, password: '', rol: item.rol, estado: item.estado ?? true, isActive: item.isActive !== false, bodegaIds: item.bodegasAsignadas?.map(b => b.id) || [] }); setModalOpen(true); }}
            className="text-accent hover:text-accent/80 p-1.5 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
            title="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button
            onClick={() => handleToggleActive(item)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              item.isActive !== false
                ? 'text-warning hover:text-warning/80 hover:bg-warning/10'
                : 'text-success hover:text-success/80 hover:bg-success/10'
            }`}
            title={item.isActive !== false ? 'Suspender' : 'Activar'}
          >
            {item.isActive !== false ? <PowerOff size={14} /> : <Power size={14} />}
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
          <h1 className="text-2xl font-bold text-text-primary">Usuarios</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona accesos, roles y credenciales de usuario del sistema.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Nuevo Usuario
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
            Activos
          </button>
          <button
            onClick={() => setShowSuspended(true)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              showSuspended ? 'bg-danger/10 text-danger border border-danger/30' : 'text-text-secondary hover:bg-elevated border border-transparent'
            }`}
          >
            Suspendidos
          </button>
        </div>
        <DataTable columns={columns} data={filteredUsers} loading={isLoading} searchable searchKeys={['nombre', 'email', 'rol']} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'} size="lg">
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
                  bodegaIds: newRol !== 'BODEGUERO' ? [] : f.bodegaIds,
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
            <div className="animate-fade-in space-y-2">
              <label className="block text-sm font-medium text-text-primary">Bodegas Asignadas *</label>
              <p className="text-xs text-text-muted">Selecciona una o más bodegas que este bodeguero podrá gestionar.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto bg-base p-3 rounded-xl border border-border-subtle">
                {bodegaList.map((b: any) => (
                  <label
                    key={b.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      form.bodegaIds.includes(b.id)
                        ? 'bg-accent/10 border border-accent/30'
                        : 'hover:bg-elevated border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.bodegaIds.includes(b.id)}
                      onChange={() => toggleBodega(b.id)}
                      className="h-4 w-4 rounded border-border-default bg-elevated text-accent focus:ring-accent/30 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-medium text-text-primary">{b.nombre}</span>
                      <span className="text-xs text-text-muted block">{b.ubicacion}</span>
                    </div>
                  </label>
                ))}
              </div>
              {form.bodegaIds.length === 0 && (
                <p className="text-xs text-danger">Debe seleccionar al menos una bodega.</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 bg-base p-3.5 rounded-xl border border-border-subtle">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="h-5 w-5 rounded-lg border-border-default bg-elevated text-success focus:ring-success/30 focus:ring-offset-0 transition-all cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-text-primary cursor-pointer">
              Usuario activo (suspendido = no puede iniciar sesión)
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
