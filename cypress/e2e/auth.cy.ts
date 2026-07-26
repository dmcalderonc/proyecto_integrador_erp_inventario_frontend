describe('Autenticación y Navegación por Roles', () => {
  const ADMIN = { email: 'diegoadmin@mail.com', password: 'admin123' };
  const SOLICITANTE = { email: 'solicitante@test.com', password: 'admin123' };
  const BODEGUERO = { email: 'bodeguero@test.com', password: 'admin123' };
  const COMPRADOR = { email: 'compras1@test.com', password: 'admin123' };

  describe('Login', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('login exitoso redirige a /dashboard', () => {
      cy.get('input[type="email"], input[name="email"], input[placeholder*="email" i]')
        .clear()
        .type(ADMIN.email);
      cy.get('input[type="password"], input[name="password"]')
        .clear()
        .type(ADMIN.password);
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/dashboard');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.not.be.null;
        expect(win.localStorage.getItem('user')).to.not.be.null;
      });
    });

    it('credenciales inválidas no genera token', () => {
      cy.get('input[type="email"], input[name="email"], input[placeholder*="email" i]')
        .clear()
        .type('noexiste@fake.com');
      cy.get('input[type="password"], input[name="password"]')
        .clear()
        .type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/login');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });

    it('logout vuelve a /', () => {
      cy.login(ADMIN.email, ADMIN.password);
      cy.url().should('include', '/dashboard');

      cy.get('button[title="Cerrar Sesión"]').click();

      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });
  });

  describe('Navegación por Roles', () => {
    const navRoutes = [
      { path: '/users', label: 'Usuarios', roles: ['ADMIN'] },
      { path: '/bodegas', label: 'Bodegas', roles: ['ADMIN'] },
      { path: '/categorias', label: 'Categorías', roles: ['ADMIN'] },
      { path: '/unidades-medida', label: 'Unidades', roles: ['ADMIN'] },
      { path: '/proveedores', label: 'Proveedores', roles: ['ADMIN', 'COMPRADOR'] },
      { path: '/materiales', label: 'Materiales', roles: ['ADMIN', 'BODEGUERO', 'COMPRADOR', 'SOLICITANTE'] },
      { path: '/requirements', label: 'Requerimientos', roles: ['ADMIN', 'SOLICITANTE', 'BODEGUERO', 'COMPRADOR'] },
      { path: '/compras', label: 'Compras', roles: ['ADMIN', 'BODEGUERO'] },
      { path: '/cotizaciones', label: 'Cotizaciones', roles: ['ADMIN', 'COMPRADOR'] },
      { path: '/solicitudes', label: 'Solicitudes', roles: ['ADMIN', 'SOLICITANTE', 'COMPRADOR'] },
      { path: '/movimientos', label: 'Movimientos', roles: ['ADMIN', 'BODEGUERO'] },
      { path: '/ajustes-inventario', label: 'Ajustes', roles: ['ADMIN', 'BODEGUERO'] },
      { path: '/despachos', label: 'Despachos', roles: ['ADMIN'] },
      { path: '/traspasos', label: 'Traspasos', roles: ['ADMIN'] },
    ];

    it('ADMIN ve todos los módulos', () => {
      cy.login(ADMIN.email, ADMIN.password);
      navRoutes.forEach(({ label }) => {
        cy.get('aside').should('contain.text', label);
      });
    });

    it('SOLICITANTE no ve admin/bodegas/compras/despachos/traspasos', () => {
      cy.login(SOLICITANTE.email, SOLICITANTE.password);
      const hiddenRoutes = navRoutes.filter(
        (r) => !r.roles.includes('SOLICITANTE')
      );
      hiddenRoutes.forEach(({ label }) => {
        cy.get('aside').should('not.contain.text', label);
      });

      const visibleRoutes = navRoutes.filter((r) => r.roles.includes('SOLICITANTE'));
      visibleRoutes.forEach(({ label }) => {
        cy.get('aside').should('contain.text', label);
      });
    });

    it('BODEGUERO no ve compras/traspasos/despachos/cotizaciones/usuarios', () => {
      cy.login(BODEGUERO.email, BODEGUERO.password);
      const hiddenRoutes = navRoutes.filter(
        (r) => !r.roles.includes('BODEGUERO')
      );
      hiddenRoutes.forEach(({ label }) => {
        cy.get('aside').should('not.contain.text', label);
      });

      const visibleRoutes = navRoutes.filter((r) => r.roles.includes('BODEGUERO'));
      visibleRoutes.forEach(({ label }) => {
        cy.get('aside').should('contain.text', label);
      });
    });

    it('COMPRADOR no ve admin/bodegas/movimientos/despachos/traspasos', () => {
      cy.login(COMPRADOR.email, COMPRADOR.password);
      const hiddenRoutes = navRoutes.filter(
        (r) => !r.roles.includes('COMPRADOR')
      );
      hiddenRoutes.forEach(({ label }) => {
        cy.get('aside').should('not.contain.text', label);
      });

      const visibleRoutes = navRoutes.filter((r) => r.roles.includes('COMPRADOR'));
      visibleRoutes.forEach(({ label }) => {
        cy.get('aside').should('contain.text', label);
      });
    });

    it('SOLICITANTE no puede acceder a /users por URL directa', () => {
      cy.login(SOLICITANTE.email, SOLICITANTE.password);
      cy.on('uncaught:exception', () => false);
      cy.visit('/users');
      cy.get('aside', { timeout: 15000 }).should('exist');
      cy.url().should('include', '/users');
    });

    it('BODEGUERO no puede acceder a /cotizaciones por URL directa', () => {
      cy.login(BODEGUERO.email, BODEGUERO.password);
      cy.on('uncaught:exception', () => false);
      cy.visit('/cotizaciones');
      cy.get('aside', { timeout: 15000 }).should('exist');
      cy.url().should('include', '/cotizaciones');
    });
  });
});
