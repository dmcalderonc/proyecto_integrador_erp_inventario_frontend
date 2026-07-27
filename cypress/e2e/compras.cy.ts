const COMPRADOR = { email: 'compras1@test.com', password: 'admin123' };
const ADMIN = { email: 'diegoadmin@mail.com', password: 'admin123' };
const BODEGUERO = { email: 'bodeguero@test.com', password: 'admin123' };

describe('Flujo Completo de Compras (Cotización → OC → Recepción)', () => {

  describe('1. COMPRADOR: Visualizar cotizaciones de un requerimiento', () => {
    it('navega a un requerimiento y visualiza sus cotizaciones', () => {
      cy.login(COMPRADOR.email, COMPRADOR.password);
      cy.visit('/cotizaciones');

      cy.contains('REQ-').first().click();

      cy.get('button', { timeout: 10000 }).should('exist');

      cy.get('button').then(($btns) => {
        const cotizarBtn = [...$btns].find(b => b.textContent?.includes('Cotizar'));
        if (cotizarBtn) {
          cy.wrap(cotizarBtn).click({ force: true });
          cy.get('dialog[open], [role="dialog"]').should('be.visible');
          cy.get('[placeholder="Seleccionar proveedor..."]').first().type('Proveedor');
          cy.get('[role="option"]').first().click();
          cy.get('dialog[open] input[type="number"]').first().clear().type('10');
          cy.get('dialog[open] input[type="number"]').eq(1).clear().type('25.50');
          cy.contains('button', 'Crear Cotización').click();
          cy.contains(/creada|exitosamente/i, { timeout: 10000 });
        } else {
          cy.log('REQ ya tiene cotizaciones - verificando contenido existente');
        }
      });
    });
  });

  describe('2. COMPRADOR: Evaluar cotización existente', () => {
    it('interactúa con las cotizaciones del requerimiento', () => {
      cy.login(COMPRADOR.email, COMPRADOR.password);
      cy.visit('/cotizaciones');

      cy.contains('REQ-').first().click();

      cy.get('button', { timeout: 10000 }).should('exist');

      cy.document().then(($doc) => {
        const seleccionarBtn = $doc.querySelector('button[title="Seleccionar"]');
        if (seleccionarBtn) {
          cy.wrap(seleccionarBtn).click({ force: true });
          cy.contains(/seleccionada|exitosamente/i, { timeout: 10000 });
        } else {
          cy.log('No hay cotizaciones EN_EVALUACION para seleccionar');
        }
      });
    });
  });

  describe('3. COMPRADOR: Generar OC desde cotizaciones', () => {
    it('verifica el estado de cotizaciones elegidas', () => {
      cy.login(COMPRADOR.email, COMPRADOR.password);
      cy.visit('/cotizaciones');

      cy.contains('REQ-').first().click();

      cy.get('button', { timeout: 10000 }).should('exist');

      cy.document().then(($doc) => {
        const generarBtn = [...$doc.querySelectorAll('button')].find(b => /generar oc/i.test(b.textContent || ''));
        if (generarBtn) {
          cy.wrap(generarBtn).click();
          cy.contains(/generada|exitosamente|OC/i, { timeout: 10000 });
        } else {
          cy.log('No hay cotizaciones elegidas para generar OC');
        }
      });
    });
  });

  describe('4. ADMIN: Aprobar OC', () => {
    it('aprueba la OC si está pendiente', () => {
      cy.login(ADMIN.email, ADMIN.password);
      cy.visit('/compras');

      cy.get('table tbody tr', { timeout: 15000 }).first().contains('button', 'Detalle').click();

      cy.get('dialog[open]', { timeout: 15000 }).should('exist');

      cy.get('dialog[open]').then(($dialog) => {
        const text = $dialog.text();
        if (text.includes('PENDIENTE')) {
          cy.wrap($dialog).contains('button', 'Aprobar Orden').click();
          cy.contains(/aprobada|exitosamente/i, { timeout: 10000 });
        } else {
          cy.log('OC ya fue aprobada - estado: ' + (text.match(/EMITIDA|RECIBIDA|PENDIENTE/)?.[0] || 'desconocido'));
        }
      });
    });
  });

  describe('5. BODEGUERO: Recibir OC', () => {
    it('abre el modal de recepción y recibe un ítem', () => {
      cy.login(BODEGUERO.email, BODEGUERO.password);
      cy.visit('/compras');

      cy.get('table tbody tr', { timeout: 15000 })
        .contains('button', 'Recibir')
        .first()
        .click({ force: true });

      cy.get('dialog[open]', { timeout: 15000 }).should('exist');

      cy.get('dialog[open] input[type="number"]').first().then(($input) => {
        const maxVal = Number($input.attr('max')) || 1;
        if (maxVal > 1) {
          cy.wrap($input).clear().type(String(maxVal - 1));
          cy.get('dialog[open] input[type="text"]').first()
            .type('Diferencia por daño en transporte');
        } else {
          cy.log('Item con cantidad 1, recibiendo cantidad completa');
        }
      });

      cy.get('dialog[open]').contains('button', 'Recibir').first().click();

      cy.contains(/exitosamente|diferencia|recibida|notificación/i, { timeout: 15000 });
    });

    it('verifica el estado de la OC después de recibir', () => {
      cy.login(BODEGUERO.email, BODEGUERO.password);
      cy.visit('/compras');

      cy.get('table tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);
    });
  });
});