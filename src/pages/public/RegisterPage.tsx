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
import { UserPlus } from 'lucide-react';

const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

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
        nombre: data.nombre,
        email: data.email,
        password: data.password,
      });
      const { access_token, user } = res.data.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      }));
      toast.success('Cuenta creada exitosamente');
      window.location.replace('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 bg-base text-text-primary border rounded-xl text-sm placeholder-text-muted focus:outline-none focus:ring-1 transition-all ${
      hasError ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border-subtle focus:border-accent focus:ring-accent/30'
    }`;

  return (
    <div className="min-h-screen bg-base text-text-secondary flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full animate-slide-up">
          <div className="bg-surface border border-border-subtle rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-success-bg border border-success/20 mb-4">
                <UserPlus size={24} className="text-success" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Crear Cuenta</h1>
              <p className="mt-2 text-sm text-text-secondary">Regístrate para acceder al sistema</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Nombre completo</label>
                <input type="text" placeholder="Tu nombre" className={inputClass(!!errors.nombre)} {...register('nombre')} />
                {errors.nombre && <p className="mt-1.5 text-xs text-danger font-medium">{errors.nombre.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Correo Electrónico</label>
                <input type="email" placeholder="usuario@empresa.com" className={inputClass(!!errors.email)} {...register('email')} />
                {errors.email && <p className="mt-1.5 text-xs text-danger font-medium">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Contraseña</label>
                <input type="password" placeholder="••••••••" className={inputClass(!!errors.password)} {...register('password')} />
                {errors.password && <p className="mt-1.5 text-xs text-danger font-medium">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Confirmar contraseña</label>
                <input type="password" placeholder="••••••••" className={inputClass(!!errors.confirmPassword)} {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-danger font-medium">{errors.confirmPassword.message}</p>}
              </div>

              <Button type="submit" loading={isLoading} className="w-full py-3">
                Crear Cuenta
              </Button>

              <p className="text-center text-sm text-text-secondary pt-2">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="font-semibold text-accent hover:text-accent-hover transition-colors">
                  Iniciar Sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
