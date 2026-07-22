import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      await login({ email: data.email, password: data.password });
      toast.success('¡Bienvenido!');
      window.location.replace(from);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-text-secondary flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full animate-slide-up">
          <div className="bg-surface border border-border-subtle rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
                <LogIn size={24} className="text-accent" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Iniciar Sesión</h1>
              <p className="mt-2 text-sm text-text-secondary">Accede a tu cuenta de StockLy</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Correo Electrónico</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@empresa.com"
                  className={`w-full px-4 py-3 bg-base text-text-primary border rounded-xl text-sm placeholder-text-muted focus:outline-none focus:ring-1 transition-all ${
                    errors.email ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border-subtle focus:border-accent focus:ring-accent/30'
                  }`}
                  {...register('email')}
                />
                {errors.email && <p className="mt-1.5 text-xs text-danger font-medium">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Contraseña</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-base text-text-primary border rounded-xl text-sm placeholder-text-muted focus:outline-none focus:ring-1 transition-all ${
                    errors.password ? 'border-danger focus:border-danger focus:ring-danger/30' : 'border-border-subtle focus:border-accent focus:ring-accent/30'
                  }`}
                  {...register('password')}
                />
                {errors.password && <p className="mt-1.5 text-xs text-danger font-medium">{errors.password.message}</p>}
              </div>

              <Button type="submit" loading={isLoading} className="w-full py-3">
                Ingresar
              </Button>

              <p className="text-center text-sm text-text-secondary pt-2">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="font-semibold text-accent hover:text-accent-hover transition-colors">
                  Registrarse
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
