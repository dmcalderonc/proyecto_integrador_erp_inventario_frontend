import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { getBadgeStyle } from '../../lib/design-tokens';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mi Perfil</h1>
        <p className="text-sm text-text-secondary mt-1">Información detallada y credenciales de tu cuenta de usuario.</p>
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6 sm:p-8 space-y-8">
        <div className="flex items-center gap-5 pb-6 border-b border-border-subtle">
          <div className="w-20 h-20 rounded-xl bg-base border border-border-subtle flex items-center justify-center text-accent shrink-0">
            <User size={38} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{user.nombre}</h2>
            <span className={`inline-block mt-2 px-3 py-1 rounded-xl text-xs font-bold border ${getBadgeStyle(user.rol)}`}>
              {user.rol}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3.5 p-4 bg-base rounded-xl border border-border-subtle">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-muted">Correo electrónico</p>
              <p className="text-sm font-bold text-text-primary truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-base rounded-xl border border-border-subtle">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Rol asignado</p>
              <p className="text-sm font-bold text-text-primary">{user.rol}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-base rounded-xl border border-border-subtle">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
              user.estado
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-danger/10 text-danger border-danger/20'
            }`}>
              {user.estado ? <CheckCircle size={18} /> : <XCircle size={18} />}
            </div>
            <div>
              <p className="text-xs text-text-muted">Estado de la cuenta</p>
              <p className={`text-sm font-bold ${user.estado ? 'text-success' : 'text-danger'}`}>
                {user.estado ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-base rounded-xl border border-border-subtle">
            <div className="w-10 h-10 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center text-warning shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-text-muted">Usuario desde</p>
              <p className="text-sm font-bold text-text-primary">
                {user.fechaCreacion
                  ? new Date(user.fechaCreacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'No disponible'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
