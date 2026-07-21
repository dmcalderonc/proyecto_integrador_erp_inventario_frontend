import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const rolColors: Record<string, string> = {
    ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    BODEGUERO: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30',
    COMPRADOR: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    SOLICITANTE: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#FFFFFF] mb-2">Mi Perfil</h1>
        <p className="text-[#94A3B8] text-sm">Información detallada y credenciales de tu cuenta de usuario.</p>
      </div>

      {/* Tarjeta de Perfil */}
      <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 sm:p-8 shadow-2xl space-y-8">
        {/* Cabecera del usuario */}
        <div className="flex items-center gap-5 pb-6 border-b border-[#334155]">
          <div className="w-20 h-20 rounded-2xl bg-[#0A1128] border border-[#334155] flex items-center justify-center text-[#06B6D4] shrink-0 shadow-inner">
            <User size={38} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#FFFFFF]">{user.nombre}</h2>
            <span className={`inline-block mt-2 px-3.5 py-1 rounded-xl text-xs font-bold border ${rolColors[user.rol] || 'bg-[#0A1128] text-[#94A3B8] border-[#334155]'}`}>
              {user.rol}
            </span>
          </div>
        </div>

        {/* Lista de Detalles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3.5 p-4 bg-[#0A1128] rounded-2xl border border-[#334155]">
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4] shrink-0">
              <Mail size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#94A3B8]">Correo electrónico</p>
              <p className="text-sm font-bold text-[#FFFFFF] truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-[#0A1128] rounded-2xl border border-[#334155]">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Rol asignado</p>
              <p className="text-sm font-bold text-[#FFFFFF]">{user.rol}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-[#0A1128] rounded-2xl border border-[#334155]">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              user.estado 
                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' 
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              {user.estado ? <CheckCircle size={18} /> : <XCircle size={18} />}
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Estado de la cuenta</p>
              <p className={`text-sm font-bold ${user.estado ? 'text-[#10B981]' : 'text-red-400'}`}>
                {user.estado ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 bg-[#0A1128] rounded-2xl border border-[#334155]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Usuario desde</p>
              <p className="text-sm font-bold text-[#FFFFFF]">
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