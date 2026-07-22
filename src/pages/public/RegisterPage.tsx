import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/http';
import { Button } from '../../components/ui/Button';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

const registerSchema = z.object({
  username: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Por favor ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

interface FloatingShapeProps {
  className: string;
  style?: React.CSSProperties;
}

function FloatingShape({ className, style }: FloatingShapeProps) {
  return <div className={`absolute rounded-full opacity-20 blur-sm animate-pulse ${className}`} style={style} />;
}

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      const { access_token, user } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Cuenta creada exitosamente');
      navigate('/');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al registrar. Intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1128] text-[#94A3B8] flex flex-col justify-between overflow-hidden relative">
      <Navbar />

      {/* Estilos de animación consistentes */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(10px) rotate(-3deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
      `}</style>

      {/* Fondo degradado y rejilla */}
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background: 'linear-gradient(135deg, #0A1128, #111D4A, #1E293B, #111D4A, #0A1128)',
          backgroundSize: '400% 400%',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Formas flotantes */}
      <FloatingShape className="w-72 h-72 bg-[#10B981] top-10 -left-20 animate-float" />
      <FloatingShape className="w-48 h-48 bg-[#06B6D4] bottom-1/3 right-10 animate-float-slow" style={{ animationDelay: '1.5s' }} />
      <FloatingShape className="w-32 h-32 bg-[#10B981] bottom-10 left-1/4 animate-float" style={{ animationDelay: '2s' }} />

      {/* Contenido principal */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-[#111D4A] backdrop-blur-lg p-8 sm:p-10 rounded-3xl border border-[#334155] shadow-2xl animate-slide-up">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 mb-4 text-[#10B981]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-[#FFFFFF]">
              Crear Cuenta
            </h2>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Regístrate para acceder al sistema <span className="text-[#10B981] font-semibold">Stockly</span>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[#FFFFFF] mb-1.5">
                  Nombre completo
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="name"
                  placeholder="Ej: Juan Pérez"
                  className={`appearance-none block w-full px-4 py-3 bg-[#0A1128] text-[#FFFFFF] border ${
                    errors.username ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:border-[#06B6D4]'
                  } rounded-xl shadow-sm placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 text-sm transition-all`}
                  {...register('username')}
                />
                {errors.username && (
                  <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#FFFFFF] mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  className={`appearance-none block w-full px-4 py-3 bg-[#0A1128] text-[#FFFFFF] border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:border-[#06B6D4]'
                  } rounded-xl shadow-sm placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 text-sm transition-all`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#FFFFFF] mb-1.5">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  className={`appearance-none block w-full px-4 py-3 bg-[#0A1128] text-[#FFFFFF] border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:border-[#06B6D4]'
                  } rounded-xl shadow-sm placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 text-sm transition-all`}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#FFFFFF] mb-1.5">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repite tu contraseña"
                  className={`appearance-none block w-full px-4 py-3 bg-[#0A1128] text-[#FFFFFF] border ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-[#334155] focus:border-[#06B6D4]'
                  } rounded-xl shadow-sm placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 text-sm transition-all`}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full flex justify-center py-3.5 px-4 bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 hover:shadow-[#0284C7]/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2"></div>
                    Creando cuenta...
                  </div>
                ) : (
                  'Registrarse'
                )}
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm text-[#94A3B8]">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-semibold text-[#10B981] hover:text-[#10B981]/80 hover:underline transition-colors">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}