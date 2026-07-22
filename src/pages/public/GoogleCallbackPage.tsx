import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export default function GoogleCallbackPage() {
    const [searchParams] = useSearchParams();
    const { loginWithToken } = useAuth();
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            const errorMessages: Record<string, string> = {
                no_user_data: 'No se pudieron obtener los datos de Google',
                account_disabled: 'Tu cuenta está desactivada. Contacta al administrador.',
                auth_failed: 'Error al autenticar con Google. Intenta de nuevo.',
            };
            toast.error(errorMessages[error] || 'Error al autenticar con Google');
            window.location.replace('/login');
            return;
        }

        if (!token) {
            toast.error('No se recibió token de autenticación');
            window.location.replace('/login');
            return;
        }

        try {
            loginWithToken(token);
            toast.success('¡Inicio de sesión con Google exitoso!');
            window.location.replace('/dashboard');
        } catch {
            toast.error('Error al procesar la autenticación');
            window.location.replace('/login');
        }
    }, [searchParams, loginWithToken]);

    return (
        <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#10B981] border-r-transparent mb-4"></div>
                <p className="text-[#94A3B8] text-sm">Autenticando con Google...</p>
            </div>
        </div>
    );
}
