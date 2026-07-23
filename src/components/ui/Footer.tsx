export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5" style={{ fontFamily: "var(--font-heading)" }}>
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="Stockly" className="w-4 h-4 object-contain" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">stockly</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Stockly — Proyecto Integrador. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
