import { cn } from './utils';

describe('cn()', () => {
  test('une clases simples', () => {
    expect(cn('text-red', 'text-blue')).toBe('text-blue');
  });

  test('maneja undefined/null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  test('resuelve conflictos de tailwind', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  test('retorna string vacío sin argumentos', () => {
    expect(cn()).toBe('');
  });
});
