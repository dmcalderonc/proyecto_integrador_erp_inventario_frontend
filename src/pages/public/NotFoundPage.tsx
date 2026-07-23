import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { PackageOpen, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="text-center animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-surface border border-border-subtle mb-6">
          <PackageOpen size={36} className="text-text-muted" />
        </div>
        <h1 className="text-6xl font-bold text-text-primary mb-2">404</h1>
        <p className="text-text-secondary mb-8">La página que buscas no existe.</p>
        <Link to="/">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft size={16} /> Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
