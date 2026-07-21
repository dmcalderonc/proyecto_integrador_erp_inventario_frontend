import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export default function GoogleCallbackPage() {
    const [searchParams] = useSearchParams();
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            toast.error('No se recibió token de autenticación');
            navigate('/login');
            return;
        }

        try {
            loginWithToken(token);
            toast.success('¡Inicio de sesión con Google exitoso!');
            navigate('/dashboard');
        } catch {
            toast.error('Error al procesar la autenticación');
            navigate('/login');
        }
    }, [searchParams, loginWithToken, navigate]);

    return (
        <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#10B981] border-r-transparent mb-4"></div>
                <p className="text-[#94A3B8] text-sm">Autenticando con Google...</p>
            </div>
        </div>
    );
}
