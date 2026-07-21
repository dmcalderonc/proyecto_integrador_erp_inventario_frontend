import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const rolColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    BODEGUERO: 'bg-blue-100 text-blue-800',
    COMPRADOR: 'bg-amber-100 text-amber-800',
    SOLICITANTE: 'bg-green-100 text-green-800',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={32} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.nombre}</h2>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${rolColors[user.rol] || 'bg-gray-100 text-gray-800'}`}>
              {user.rol}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Correo electrónico</p>
              <p className="text-sm font-medium text-gray-800">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Rol</p>
              <p className="text-sm font-medium text-gray-800">{user.rol}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {user.estado ? (
              <CheckCircle size={18} className="text-green-500" />
            ) : (
              <XCircle size={18} className="text-red-500" />
            )}
            <div>
              <p className="text-xs text-gray-500">Estado</p>
              <p className="text-sm font-medium text-gray-800">{user.estado ? 'Activo' : 'Inactivo'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calendar size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Usuario desde</p>
              <p className="text-sm font-medium text-gray-800">
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
