import { Package } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Package size={18} />
            <span className="text-sm font-medium">StockLy ERP</span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} StockLy — Proyecto Integrador. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
