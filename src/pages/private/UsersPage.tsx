import React, { useState } from 'react';
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
  BODEGUERO: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30',
  COMPRADOR: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  SOLICITANTE: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
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
      render: (item: User) => <span className="text-[#FFFFFF] font-bold">{item.nombre}</span> 
    },
    { 
      key: 'email', 
      header: 'Email', 
      sortable: true,
      render: (item: User) => <span className="text-[#06B6D4] font-medium">{item.email}</span> 
    },
    {
      key: 'rol', 
      header: 'Rol', 
      sortable: true, 
      sortValue: (item: User) => item.rol,
      render: (item: User) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${rolColors[item.rol] || 'bg-[#0A1128] text-[#94A3B8] border-[#334155]'}`}>
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
            ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' 
            : 'bg-[#0A1128] text-[#94A3B8]/60 border-[#334155]'
        }`}>
          {item.estado ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FFFFFF] mb-2">Usuarios</h1>
          <p className="text-[#94A3B8] text-sm">Gestiona accesos, roles y credenciales de usuario del sistema.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-5 py-3 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={18} /> Nuevo Usuario
        </Button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl overflow-hidden">
        <DataTable columns={columns} data={users} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={["nombre", "email", "rol"]} />
      </div>

      {/* Modal de Crear / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-[#94A3B8] p-1">
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Nombre de usuario</label>
            <input 
              placeholder="Ej: Juan Pérez" 
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Correo electrónico</label>
            <input 
              type="email" 
              placeholder="Ej: usuario@mail.com" 
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">
              Contraseña {editing && <span className="text-[#94A3B8]/60 font-normal">(dejar vacío para mantener la actual)</span>}
            </label>
            <input 
              type="password" 
              placeholder={editing ? '••••••••' : 'Mínimo 6 caracteres'} 
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" 
              minLength={6}
              {...(!editing && { required: true })} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Rol</label>
            <select 
              value={form.rol} 
              onChange={e => setForm({ ...form, rol: e.target.value as UserRole })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all cursor-pointer font-semibold"
            >
              {ROLES.map(r => <option key={r} value={r} className="bg-[#0A1128]">{r}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-[#0A1128] p-3.5 rounded-2xl border border-[#334155]">
            <input 
              type="checkbox" 
              id="is_active" 
              checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })}
              className="h-5 w-5 rounded-lg border-[#334155] bg-[#111D4A] text-[#10B981] focus:ring-[#10B981] focus:ring-offset-0 transition-all cursor-pointer" 
            />
            <label htmlFor="is_active" className="text-sm font-medium text-[#FFFFFF] cursor-pointer">
              Usuario activo
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
        title="Eliminar usuario"
        message={`¿Estás seguro de eliminar al usuario "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending} 
      />
    </div>
  );
}