import { describe, test, expect } from 'vitest';
import { filterStock } from './filterStock';

const materiales = [
  { id: 1, nombre: 'A', stockDisponible: 0 },
  { id: 2, nombre: 'B', stockDisponible: 3 },
  { id: 3, nombre: 'C', stockDisponible: 10 },
  { id: 4, nombre: 'D', stockDisponible: null },
  { id: 5, nombre: 'E', stockDisponible: 5 },
];

describe('filterStock', () => {
  test('filtro vacío retorna todos', () => {
    expect(filterStock(materiales, '')).toHaveLength(5);
  });

  test('agotado retorna solo stock 0', () => {
    const result = filterStock(materiales, 'agotado');
    expect(result).toHaveLength(2); // id:1 (0) y id:4 (null → 0)
    expect(result.map(m => m.id)).toEqual([1, 4]);
  });

  test('bajo retorna stock > 0 y <= 5', () => {
    const result = filterStock(materiales, 'bajo');
    expect(result).toHaveLength(2); // id:2 (3) y id:5 (5)
    expect(result.map(m => m.id)).toEqual([2, 5]);
  });

  test('normal retorna stock > 5', () => {
    const result = filterStock(materiales, 'normal');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  test('stockDisponible undefined se trata como 0', () => {
    const data = [{ stockDisponible: undefined }];
    expect(filterStock(data, 'agotado')).toHaveLength(1);
  });

  test('filtro desconocido retorna todos', () => {
    expect(filterStock(materiales, 'xyz')).toHaveLength(5);
  });
});