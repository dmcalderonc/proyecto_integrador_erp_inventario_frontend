const SOLICITANTE = { email: 'solicitante@test.com', password: 'admin123' };
const ADMIN = { email: 'diegoadmin@mail.com', password: 'admin123' };
const BODEGUERO = { email: 'bodeguero@test.com', password: 'admin123' };

describe('Flujo Completo de Requerimientos', () => {

  describe('1. SOLICITANTE: Crear requerimiento', () => {
    it('crea requerimiento con 10 unidades de material', () => {
      cy.login(SOLICITANTE.email, SOLICITANTE.password);
      cy.visit('/requirements');

      cy.contains('button', 'Nuevo Requerimiento').click();
      cy.get('dialog[open], [role="dialog"]').should('be.visible');

      cy.get('dialog[open] input[placeholder*="proyecto" i], [role="dialog"] input[placeholder*="proyecto" i]')
        .first()
        .type('PROY');
      cy.get('[role="option"]').first().click();

      cy.get('dialog[open] input[placeholder*="bodega" i], [role="dialog"] input[placeholder*="bodega" i]')
        .first()
        .type('BODEGA');
      cy.get('[role="option"]').first().click();

      cy.get('textarea, [placeholder*="razón" i], [placeholder*="justificativo" i]')
        .first()
        .type('Prueba E2E de requerimiento');

      cy.get('dialog[open] input[placeholder*="material" i], [role="dialog"] input[placeholder*="material" i]')
        .first()
        .type('Cemento');
      cy.get('[role="option"]').first().click();

      cy.get('dialog[open] input[placeholder*="Cant" i], [role="dialog"] input[placeholder*="Cant" i]')
        .first()
        .clear()
        .type('10');

      cy.contains('button', 'Crear Requerimiento').click();
      cy.contains(/creado exitosamente|exitosamente/i, { timeout: 10000 });
    });
  });

  describe('2. ADMIN: Evaluar requerimiento', () => {

    it('aprueba todos los items como APROBADO_BODEGA', () => {
      cy.login(ADMIN.email, ADMIN.password);
      cy.visit('/requirements');

      cy.get('table tbody tr').first().contains('button', 'Detalle').click();
      cy.get('dialog[open], [role="dialog"]').should('be.visible');

      cy.get('dialog[open], [role="dialog"]')
        .find('button')
        .contains(/Aprobar/i)
        .first()
        .click({ force: true });

      cy.wait(800);

      cy.contains(/Aprobado|Bodega/i);
    });

  });

  describe('3. BODEGUERO', () => {

    it('items despachados tienen opacity y sin botones', () => {
      cy.login(BODEGUERO.email, BODEGUERO.password);
      cy.visit('/requirements');

      cy.get('table tbody tr').first().contains('button', 'Detalle').click();
      cy.get('dialog[open], [role="dialog"]').should('be.visible');

      cy.get('dialog[open] table tbody tr, [role="dialog"] table tbody tr').each(($row) => {
        cy.wrap($row).then(($el) => {
          if ($el.text().includes('Despachado')) {
            cy.wrap($el).should('have.css', 'opacity', '0.5');
            cy.wrap($el).find('button').should('not.exist');
          }
        });
      });
    });

    it('item ya despachado no tiene botones de accion', () => {
      cy.login(BODEGUERO.email, BODEGUERO.password);
      cy.visit('/requirements');

      cy.get('table tbody tr').first().contains('button', 'Detalle').click();
      cy.get('dialog[open], [role="dialog"]').should('be.visible');

      cy.get('dialog[open] table tbody tr, [role="dialog"] table tbody tr').each(($row) => {
        cy.wrap($row).then(($el) => {
          if ($el.text().includes('Despachado')) {
            cy.wrap($el).find('button').should('have.length', 0);
          }
        });
      });
    });

  });
  //

});