import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from './DataTable';
import { vi } from 'vitest';

const columns = [
  { key: 'nombre', header: 'Nombre', sortable: true },
  { key: 'categoria', header: 'Categoría' },
];

const data = [
  { id: 1, nombre: 'Laptop', categoria: 'Electrónica' },
  { id: 2, nombre: 'Mouse', categoria: 'Electrónica' },
];

describe('DataTable', () => {
  test('renderiza los datos correctamente en la tabla', () => {
    render(<DataTable columns={columns} data={data} />);
    // Usamos getAllByText para evitar conflictos si se renderiza en mobile y desktop a la vez
    expect(screen.getAllByText('Laptop')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Mouse')[0]).toBeInTheDocument();
  });

  test('filtra los datos al escribir en el buscador', () => {
    render(<DataTable columns={columns} data={data} searchable searchKeys={['nombre']} />);
    
    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: 'Laptop' } });

    expect(screen.getAllByText('Laptop')[0]).toBeInTheDocument();
    expect(screen.queryByText('Mouse')).not.toBeInTheDocument();
  });

  test('ejecuta onRowClick al hacer clic en una fila', () => {
    const handleRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={handleRowClick} />);
    
    fireEvent.click(screen.getAllByText('Laptop')[0]);
    expect(handleRowClick).toHaveBeenCalledWith(data[0]);
  });
});