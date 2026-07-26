import { PERMISSIONS, ROLES } from './permissions';

describe('permissions', () => {
  test('CAN_VIEW_MATERIALES incluye SOLICITANTE', () => {
    expect(PERMISSIONS.CAN_VIEW_MATERIALES).toContain(ROLES.SOLICITANTE);
  });
  test('CAN_MANAGE_COMPRAS NO incluye COMPRADOR', () => {
    expect(PERMISSIONS.CAN_MANAGE_COMPRAS).not.toContain(ROLES.COMPRADOR);
  });
});
