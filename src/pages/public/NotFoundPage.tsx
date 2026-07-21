import { Link } from 'react-router-dom';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300">404</h1>
          <p className="mt-4 text-lg text-gray-600">Página no encontrada</p>
          <Link to="/" className="mt-6 inline-block text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
