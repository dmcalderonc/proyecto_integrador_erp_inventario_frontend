import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';
import { vi } from 'vitest';

describe('ConfirmDialog', () => {
  test('no renderiza cuando open=false', () => {
    render(
      <ConfirmDialog open={false} onClose={vi.fn()} onConfirm={vi.fn()} title="¿Eliminar?" message="Se eliminará" />
    );
    expect(screen.queryByText('¿Eliminar?')).not.toBeInTheDocument();
  });

  test('renderiza título y mensaje cuando open=true', () => {
    render(
      <ConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} title="¿Eliminar?" message="Se eliminará este item" />
    );
    expect(screen.getByText('¿Eliminar?')).toBeInTheDocument();
    expect(screen.getByText('Se eliminará este item')).toBeInTheDocument();
  });

  test('llama onConfirm al confirmar', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog open={true} onClose={vi.fn()} onConfirm={onConfirm} title="¿Eliminar?" message="Se eliminará" confirmLabel="Eliminar" />
    );
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  test('llama onClose al cancelar', () => {
    const onClose = vi.fn();
    render(
      <ConfirmDialog open={true} onClose={onClose} onConfirm={vi.fn()} title="¿Eliminar?" message="Se eliminará" />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });

  test('muestra loading en botón cuando loading=true', () => {
    render(
      <ConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Test" message="Msg" loading loadingLabel="Guardando..." />
    );
    expect(screen.getByText('Guardando...')).toBeInTheDocument();
  });

  test('muestra label personalizado en botón confirmar', () => {
    render(
      <ConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Test" message="Msg" confirmLabel="Sí, borrar" />
    );
    expect(screen.getByText('Sí, borrar')).toBeInTheDocument();
  });

  test('variante danger aplica estilos rojos', () => {
    render(
      <ConfirmDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} title="Peligro" message="Cuidado" variant="danger" />
    );
    expect(screen.getByText('Peligro')).toBeInTheDocument();
  });
});