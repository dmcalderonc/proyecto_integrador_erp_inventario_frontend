export function Footer() {
  return (
    <footer className="bg-base border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-text-muted">
            <Package size={16} />
            <span className="text-sm font-medium">StockLy ERP</span>
          </div>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} StockLy — Proyecto Integrador
          </p>
        </div>
      </div>
    </footer>
  );
}
