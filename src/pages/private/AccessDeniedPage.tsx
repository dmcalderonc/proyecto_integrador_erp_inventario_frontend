import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <div className="bg-surface border border-danger/20 rounded-xl p-8 md:p-12 max-w-lg w-full text-center">
        <div className="mx-auto w-20 h-20 bg-danger-bg border border-danger/20 rounded-xl flex items-center justify-center mb-6">
          <ShieldAlert size={40} className="text-danger" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-3">
          Acceso Restringido
        </h1>

        <p className="text-text-secondary text-sm md:text-base mb-8 leading-relaxed">
          Tu rol actual no tiene los privilegios necesarios para visualizar o interactuar con este módulo. Si crees que esto es un error, contacta al administrador del sistema.
        </p>

        <Button
          onClick={() => navigate('/dashboard')}
          variant="secondary"
          className="w-full sm:w-auto mx-auto justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </Button>
      </div>
    </div>
  );
};
