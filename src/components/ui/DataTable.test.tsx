import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
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

  test('muestra paginación cuando hay más registros que pageSize', () => {
    const bigData = Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      nombre: `Item ${i + 1}`,
      categoria: 'General',
    }));

    render(<DataTable columns={columns} data={bigData} searchable searchKeys={['nombre']} />);

    expect(screen.getAllByText('Item 1').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Item 41').length).toBe(0);
    expect(screen.getByText((_, el) => el?.textContent === 'Mostrando 1–40 de 45 registros')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('navega entre páginas con los controles de paginación', () => {
    const bigData = Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      nombre: `Item ${i + 1}`,
      categoria: 'General',
    }));

    render(<DataTable columns={columns} data={bigData} searchable searchKeys={['nombre']} />);

    fireEvent.click(screen.getByLabelText('Página siguiente'));

    expect(screen.queryAllByText('Item 1').length).toBe(0);
    expect(screen.getAllByText('Item 41').length).toBeGreaterThan(0);
    expect(screen.getByText((_, el) => el?.textContent === 'Mostrando 41–45 de 45 registros')).toBeInTheDocument();
  });

  test('reinicia a la primera página al buscar', () => {
    const bigData = Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      nombre: `Item ${i + 1}`,
      categoria: 'General',
    }));

    render(<DataTable columns={columns} data={bigData} searchable searchKeys={['nombre']} />);

    fireEvent.click(screen.getByLabelText('Página siguiente'));
    const input = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(input, { target: { value: 'Item' } });

    expect(screen.getAllByText('Item 1').length).toBeGreaterThan(0);
  });

  test('no muestra paginación cuando hay pocos registros', () => {
    render(<DataTable columns={columns} data={data} />);

    expect(screen.queryByLabelText('Página siguiente')).not.toBeInTheDocument();
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
  });

  test('un re-render del padre con searchKeys inline no resetea la página actual', () => {
    const bigData = Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      nombre: `Item ${i + 1}`,
      categoria: 'General',
    }));

    // `searchKeys` es un array literal: cambia de referencia en cada render del padre.
    function TableWrapper() {
      const [, setTick] = useState(0);
      return (
        <div>
          <button onClick={() => setTick(t => t + 1)}>re-render</button>
          <DataTable columns={columns} data={bigData} searchable searchKeys={['nombre']} />
        </div>
      );
    }

    render(<TableWrapper />);

    fireEvent.click(screen.getByLabelText('Página siguiente'));
    expect(screen.getAllByText('Item 41').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('re-render'));

    expect(screen.getByText((_, el) => el?.textContent === 'Mostrando 41–45 de 45 registros')).toBeInTheDocument();
    expect(screen.getAllByText('Item 41').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Item 1').length).toBe(0);
  });

  test('mantiene la página del padre cuando la búsqueda es externa (onSearch)', () => {
    const bigData = Array.from({ length: 45 }, (_, i) => ({
      id: i + 1,
      nombre: `Item ${i + 1}`,
      categoria: 'General',
    }));
    const onSearch = vi.fn();

    render(<DataTable columns={columns} data={bigData} searchable onSearch={onSearch} />);

    fireEvent.click(screen.getByLabelText('Página siguiente'));
    expect(screen.getAllByText('Item 41').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'Item 4' } });

    // Con búsqueda externa la paginación la controla el padre.
    expect(screen.getAllByText('Item 41').length).toBeGreaterThan(0);
    expect(onSearch).toHaveBeenCalledWith('Item 4');
  });
});