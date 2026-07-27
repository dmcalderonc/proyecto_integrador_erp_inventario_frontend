const API_URL = 'https://calderon-erp.uaeftt-ute.site';

const ADMIN = { email: 'diegoadmin@mail.com', password: 'admin123' };
const COMPRADOR = { email: 'compras1@test.com', password: 'admin123' };
const BODEGUERO = { email: 'bodeguero@test.com', password: 'admin123' };

const mockRequerimientosEnCompras = [
  {
    requirement: {
      id: 999,
      proyecto: { nombre: 'Proyecto E2E Test' },
      bodega: { nombre: 'Bodega Central' },
      estado: 'COTIZANDO',
    },
    detalles: [
      {
        id: 8001,
        materialId: 101,
        cantidadSolicitada: 50,
        material: { nombre: 'Disco SSD 1TB', sku: 'SSD-1TB-E2E' },
      },
    ],
  },
];

const mockDetalleCompleto = {
  detalles: [
    {
      id: 8001,
      materialId: 101,
      cantidadSolicitada: 50,
      material: { nombre: 'Disco SSD 1TB', sku: 'SSD-1TB-E2E' },
      proyecto: { nombre: 'Proyecto E2E Test' },
      usuarioSolicitante: { nombre: 'Solicitante Test' },
      bodega: { nombre: 'Bodega Central' },
      estado: 'COTIZANDO',
    },
  ],
  cotizaciones: [],
};

const mockProveedor = [{ id: 10, razon_social: 'Proveedor E2E Test S.A.' }];

const mockOcCreada = {
  id: 7001,
  codigo: 'OC-E2E-TEST',
  estado: 'PENDIENTE',
  total: 1387.50,
  subtotal: 1206.52,
  impuestos: 180.98,
};

const mockOcConDetalles = {
  ...mockOcCreada,
  detalles: [
    {
      id: 9001,
      materialId: 101,
      cantidad: 50,
      precioUnitario: 25.00,
      cantidadRecibida: 0,
      material: { nombre: 'Disco SSD 1TB', sku: 'SSD-1TB-E2E' },
    },
  ],
  proveedor: { razon_social: 'Proveedor E2E Test S.A.' },
};

describe('F3 — Flujo Compras: Cotización → OC → Recepción', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
  });

  describe('COMPRADOR: Cotizar material', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/cotizaciones/en-compras', {
        statusCode: 200,
        body: { data: mockRequerimientosEnCompras },
      }).as('getRequerimientosEnCompras');

      cy.intercept('GET', '**/cotizaciones/by-requirement/999', {
        statusCode: 200,
        body: { data: mockDetalleCompleto },
      }).as('getDetalleRequerimiento');

      cy.intercept('GET', '**/proveedores*', {
        statusCode: 200,
        body: { data: mockProveedor },
      }).as('getProveedores');

      cy.login(COMPRADOR.email, COMPRADOR.password);
      cy.visit('/cotizaciones');
      cy.wait('@getRequerimientosEnCompras');
    });

    it('ve requerimientos en COTIZANDO y puede cotizar', () => {
      cy.contains('REQ-999').should('be.visible');
      cy.contains('Proyecto E2E Test').should('be.visible');

      cy.contains('REQ-999').click();
      cy.wait('@getDetalleRequerimiento');

      cy.contains('Disco SSD 1TB').should('be.visible');
      cy.contains('50').should('be.visible');

      cy.contains('button', /Cotizar/).should('be.visible');
    });

    it('sube cotización y badge "Ya cotizado" aparece', () => {
      cy.contains('REQ-999').click();
      cy.wait('@getDetalleRequerimiento');

      cy.intercept('POST', '**/cotizaciones', {
        statusCode: 201,
        body: { data: { id: 5001, estado: 'EN_EVALUACION' } },
      }).as('createCotizacion');

      cy.intercept('GET', '**/cotizaciones/by-requirement/999', {
        statusCode: 200,
        body: {
          data: {
            ...mockDetalleCompleto,
            cotizaciones: [
              {
                id: 5001,
                estado: 'EN_EVALUACION',
                cantidad: 50,
                precioUnitario: 25.0,
                proveedor: { razon_social: 'Proveedor E2E Test S.A.' },
                requerimientoDetalleId: 8001,
              },
            ],
          },
        },
      }).as('getDetalleAfterCreate');

      cy.contains('button', /Cotizar/).first().click();

      cy.get('input[type="number"][min="1"]').first().clear().type('50');
      cy.get('input[type="number"][min="0"]').first().clear().type('25');

      cy.get('.smart-combobox, [data-testid="proveedor-combobox"]').first().type('Proveedor');
      cy.contains('Proveedor E2E Test').first().click();

      cy.contains('button', /Crear Cotización/).click();
      cy.wait('@createCotizacion');

      cy.contains(/exitosamente/i).should('be.visible');

      cy.wait('@getDetalleAfterCreate');
      cy.contains('Ya cotizado').should('be.visible');
      cy.contains('button', /Cotizar/).should('not.exist');
    });

    it('error: intenta cotizar 2× mismo item → backend rechaza', () => {
      cy.contains('REQ-999').click();
      cy.wait('@getDetalleRequerimiento');

      cy.intercept('POST', '**/cotizaciones', {
        statusCode: 400,
        body: { message: 'Ya existe una cotización activa para este material' },
      }).as('createCotizacionDuplicate');

      cy.contains('button', /Cotizar/).first().click();

      cy.get('input[type="number"][min="1"]').first().clear().type('50');
      cy.get('input[type="number"][min="0"]').first().clear().type('25');

      cy.get('.smart-combobox, [data-testid="proveedor-combobox"]').first().type('Proveedor');
      cy.contains('Proveedor E2E Test').first().click();

      cy.contains('button', /Crear Cotización/).click();
      cy.wait('@createCotizacionDuplicate');

      cy.contains(/Ya existe una cotización/i).should('be.visible');
    });
  });

  describe('ADMIN: Seleccionar cotización y generar OC', () => {
    it('selecciona cotización (ELEGIDA) y genera OC', () => {
      cy.intercept('GET', '**/cotizaciones/en-compras', {
        statusCode: 200,
        body: { data: mockRequerimientosEnCompras },
      }).as('getReqsAdmin');

      cy.intercept('GET', '**/cotizaciones/by-requirement/999', {
        statusCode: 200,
        body: {
          data: {
            ...mockDetalleCompleto,
            cotizaciones: [
              {
                id: 5001,
                estado: 'EN_EVALUACION',
                cantidad: 50,
                precioUnitario: 25.0,
                proveedor: { razon_social: 'Proveedor E2E Test S.A.' },
                requerimientoDetalleId: 8001,
              },
            ],
          },
        },
      }).as('getDetalleAdmin');

      cy.intercept('PATCH', '**/cotizaciones/5001/seleccionar', {
        statusCode: 200,
        body: { data: { id: 5001, estado: 'ELEGIDA' } },
      }).as('seleccionarCotizacion');

      cy.intercept('GET', '**/cotizaciones/by-requirement/999', {
        statusCode: 200,
        body: {
          data: {
            ...mockDetalleCompleto,
            cotizaciones: [
              {
                id: 5001,
                estado: 'ELEGIDA',
                cantidad: 50,
                precioUnitario: 25.0,
                proveedor: { razon_social: 'Proveedor E2E Test S.A.' },
                requerimientoDetalleId: 8001,
              },
            ],
          },
        },
      }).as('getDetalleAfterSelect');

      cy.intercept('POST', '**/cotizaciones/generar-oc/999', {
        statusCode: 201,
        body: { data: mockOcCreada },
      }).as('generarOC');

      cy.login(ADMIN.email, ADMIN.password);
      cy.visit('/cotizaciones');
      cy.wait('@getReqsAdmin');

      cy.contains('REQ-999').click();
      cy.wait('@getDetalleAdmin');

      cy.get('button[title="Seleccionar"]').first().click();
      cy.wait('@seleccionarCotizacion');
      cy.contains(/seleccionada/i).should('be.visible');

      cy.wait('@getDetalleAfterSelect');

      cy.contains('button', /Generar OC/).click();
      cy.wait('@generarOC');
      cy.contains(/OC generada/i).should('be.visible');
    });
  });

  describe('BODEGUERO: Recibir OC con diferencia', () => {
    it('recibe OC y cantidad difiere → requiere justificativo', () => {
      cy.intercept('GET', '**/compras', {
        statusCode: 200,
        body: { data: [mockOcCreada] },
      }).as('getCompras');

      cy.intercept('GET', '**/compras/7001', {
        statusCode: 200,
        body: { data: mockOcConDetalles },
      }).as('getOcDetalle');

      cy.login(BODEGUERO.email, BODEGUERO.password);
      cy.visit('/compras');
      cy.wait('@getCompras');

      cy.contains('OC-E2E-TEST').should('be.visible');

      cy.contains('button', /Detalle/).first().click();
      cy.wait('@getOcDetalle');

      cy.contains('Disco SSD 1TB').should('be.visible');
      cy.contains('50').should('be.visible');

      cy.contains('button', /Cerrar/).click();

      cy.intercept('GET', '**/compras/7001', {
        statusCode: 200,
        body: {
          data: {
            ...mockOcConDetalles,
            detalles: [
              {
                ...mockOcConDetalles.detalles[0],
                cantidadRecibida: 0,
              },
            ],
          },
        },
      }).as('getOcForReceive');

      cy.contains('button', /Recibir/).first().click();
      cy.wait('@getOcForReceive');

      cy.get('input[type="number"]').first().clear().type('45');

      cy.contains(/Justificativo/i).should('be.visible');
      cy.get('input[placeholder*="justificativo"], input[placeholder*="Motivo"]').first().type('Daño en tránsito - E2E Test');

      cy.intercept('PATCH', '**/compras/7001/recibir-item/9001', {
        statusCode: 200,
        body: { data: { tieneDiferencia: true } },
      }).as('recibirItem');

      cy.intercept('GET', '**/compras/7001', {
        statusCode: 200,
        body: {
          data: {
            ...mockOcConDetalles,
            detalles: [
              {
                ...mockOcConDetalles.detalles[0],
                cantidadRecibida: 45,
              },
            ],
          },
        },
      }).as('getOcAfterReceive');

      cy.contains('button', /^Recibir$/).first().click();
      cy.wait('@recibirItem');

      cy.contains(/diferencia/i).should('be.visible');
    });
  });
});
