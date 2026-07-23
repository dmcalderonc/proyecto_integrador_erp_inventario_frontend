import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/http';
import { authApi } from '../../api/auth.api';
import { User, Mail, Shield, Calendar, CheckCircle, XCircle, Camera, X, Link2, Unlink } from 'lucide-react';
import { getBadgeStyle } from '../../lib/design-tokens';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ProfilePage() {
  const { user, updateProfile, updateGoogleId } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  if (!user) return null;

  const displayImage = user.fotoPerfil || user.avatarUrl || null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato no soportado. Usa PNG, JPG, WEBP o GIF');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setUploading(true);
      try {
        await api.patch('/users/profile', { fotoPerfil: base64 });
        updateProfile(base64);
        toast.success('Foto de perfil actualizada');
      } catch {
        toast.error('Error al actualizar la foto');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    try {
      await api.patch('/users/profile', { fotoPerfil: null });
      updateProfile(null);
      toast.success('Foto de perfil eliminada');
    } catch {
      toast.error('Error al eliminar la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrl = async (url: string) => {
    if (!url) return;
    setUploading(true);
    try {
      await api.patch('/users/profile', { fotoPerfil: url });
      updateProfile(url);
      toast.success('Foto de perfil actualizada');
    } catch {
      toast.error('Error al actualizar la foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mi Perfil</h1>
        <p className="text-sm text-text-secondary mt-1">Información detallada y credenciales de tu cuenta de usuario.</p>
      </div>

      {/* Tarjeta de Perfil */}
      <div className="bg-surface rounded-xl border border-border-subtle p-6 sm:p-8 space-y-8">
        {/* Cabecera del usuario */}
        <div className="flex items-center gap-5 pb-6 border-b border-border-subtle">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-base border border-border-subtle flex items-center justify-center text-accent overflow-hidden shadow-inner">
              {displayImage ? (
                <img src={displayImage} alt={user.nombre} className="w-full h-full object-cover" />
              ) : (
                <User size={38} />
              )}
            </div>
            <label className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <Camera size={22} className="text-white" />
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={handleFileChange} className="hidden" disabled={uploading} />
            </label>
            {displayImage && (
              <button
                onClick={handleRemovePhoto}
                disabled={uploading}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{user.nombre}</h2>
            <span className={`inline-block mt-2 px-3 py-1 rounded-xl text-xs font-bold border ${getBadgeStyle(user.rol)}`}>
              {user.rol}
            </span>
          </div>
        </div>

        {/* URL de imagen */}
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">O pegar URL de imagen</label>
          <input
            type="text"
            placeholder="https://ejemplo.com/foto.jpg"
            defaultValue={displayImage?.startsWith('data:') ? '' : (displayImage || '')}
            onBlur={e => handleImageUrl(e.target.value)}
            className="w-full bg-base text-text-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-all"
          />
        </div>

        {/* Vinculación con Google */}
        <div className="p-4 bg-base rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Google</p>
                <p className="text-xs text-text-muted">
                  {user.googleId ? 'Cuenta vinculada' : 'No vinculada'}
                </p>
              </div>
            </div>
            {user.googleId ? (
              <button
                onClick={async () => {
                  try {
                    await authApi.unlinkGoogle();
                    updateGoogleId(null);
                    toast.success('Cuenta de Google desvinculada');
                  } catch {
                    toast.error('Error al desvincular Google');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <Unlink size={14} />
                Desvincular
              </button>
            ) : (
              <a
                href={`${API_URL}/auth/google`}
                onClick={() => setLinkingGoogle(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/30 rounded-xl text-xs font-bold hover:bg-[#4285F4]/20 transition-all cursor-pointer"
              >
                <Link2 size={14} />
                {linkingGoogle ? 'Vinculando...' : 'Vincular'}
              </a>
            )}
          </div>
        </div>

        {/* Lista de Detalles */}
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
