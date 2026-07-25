import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

export interface ComboboxOption {
  id: number | string;
  nombre: string;
  grupo?: string;
}

interface SmartComboboxProps {
  options: ComboboxOption[];
  value: ComboboxOption | null;
  onChange: (value: ComboboxOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SmartCombobox({ options, value, onChange, placeholder = "Seleccionar...", disabled = false }: SmartComboboxProps) {
  const [query, setQuery] = useState('');

  const filteredOptions = query === ''
    ? options
    : options.filter((option) =>
        option.nombre
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.toLowerCase().replace(/\s+/g, ''))
      );

  const hasGroups = filteredOptions.some(o => o.grupo);

  const grouped = hasGroups
    ? Object.entries(
        filteredOptions.reduce<Record<string, ComboboxOption[]>>((acc, opt) => {
          const key = opt.grupo || 'Otros';
          (acc[key] = acc[key] || []).push(opt);
          return acc;
        }, {})
      )
    : null;

  return (
    <div className="relative w-full">
      <Combobox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-xl border border-border-subtle bg-base text-left shadow-md focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30 transition-all sm:text-sm">
            <Combobox.Input
              className="w-full border-none bg-transparent py-3 pl-4 pr-10 text-text-primary placeholder-text-muted/50 focus:outline-none focus:ring-0"
              displayValue={(option: ComboboxOption) => option?.nombre || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              autoComplete="off"
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronsUpDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
            </Combobox.Button>
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-surface border border-border-subtle py-1 text-base shadow-2xl focus:outline-none sm:text-sm">
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-3 px-4 text-text-muted flex items-center gap-2">
                  <Search size={16} />
                  No se encontraron resultados.
                </div>
              ) : grouped ? (
                grouped.map(([groupName, items]) => (
                  <Fragment key={groupName}>
                    <div className="px-3 py-1.5 text-xs font-bold text-accent uppercase tracking-wider bg-elevated/50 sticky top-0">
                      {groupName}
                    </div>
                    {items.map((option) => (
                      <Combobox.Option
                        key={option.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors ${
                            active ? 'bg-accent/10 text-accent' : 'text-text-primary'
                          }`
                        }
                        value={option}
                      >
                        {({ selected, active }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                              {option.nombre}
                            </span>
                            {selected ? (
                              <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-accent' : 'text-success'}`}>
                                <Check className="h-4 w-4" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                  </Fragment>
                ))
              ) : (
                filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option.id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors ${
                        active ? 'bg-accent/10 text-accent' : 'text-text-primary'
                      }`
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                          {option.nombre}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-accent' : 'text-success'
                            }`}
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}
