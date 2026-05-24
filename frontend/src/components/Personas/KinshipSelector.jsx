import React, { useState, useMemo } from 'react';
import kinshipCategories from '../../data/kinship_categories.json';
import SearchableSelect from '../common/SearchableSelect';
import { PlusCircle } from 'lucide-react';

const KinshipSelector = ({ value, onChange, tiposRelaciones = [], categoria = 'familiar' }) => {
  // Obtener todos los nombres de relaciones familiares para filtrar los "Otros"
  const familiarNames = useMemo(() => {
    const names = new Set();
    Object.values(kinshipCategories).forEach(relations => {
      relations.forEach(rel => names.add(rel.name));
    });
    return names;
  }, []);

  // Filtrar tipos de relaciones que no son familiares (son "otros")
  const otherTypes = useMemo(() => {
    const others = tiposRelaciones.filter(tipo => !familiarNames.has(tipo));
    return others.map(tipo => ({ label: tipo, value: tipo }));
  }, [tiposRelaciones, familiarNames]);

  const handleSelectChange = (newValue) => {
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Solo mostrar categorías familiares si la categoría es 'familiar' */}
        {categoria === 'familiar' && Object.entries(kinshipCategories).map(([category, relations]) => {
          const options = relations.map(rel => ({
            label: rel.name,
            value: rel.name,
            subtitle: rel.degree
          }));
          
          return (
            <SearchableSelect
              key={category}
              label={category}
              options={options}
              value={relations.some(r => r.name === value) ? value : ""}
              onChange={handleSelectChange}
              placeholder="Buscar parentesco..."
            />
          );
        })}

        {/* Categoría "Otro" - Siempre visible o solo si es 'otro'? 
            El usuario dice "si pones otro, que tenga que ser otro". 
            Así que si es 'otro', solo mostramos esto. */}
        {categoria === 'otro' && (
          <div className="space-y-1 col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Relaciones ya registradas (No familiares)
            </label>
            <SearchableSelect
              options={otherTypes}
              value={otherTypes.some(o => o.value === value) ? value : ""}
              onChange={handleSelectChange}
              placeholder="Buscar en otros..."
            />
          </div>
        )}
      </div>
      
      {/* Opción para escribir manualmente o seleccionar de 'Otros' */}
      <div className="pt-2 border-t border-gray-700/50">
        <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          <PlusCircle size={14} className="text-blue-400" />
          Define un tipo de relación personalizado:
        </label>
        <SearchableSelect
          options={otherTypes}
          value={otherTypes.some(o => o.value === value) || !familiarNames.has(value) ? value : ""}
          onChange={handleSelectChange}
          placeholder="Escribe o busca un tipo de relación..."
          isCreatable={true}
          className={categoria === 'otro' ? 'border-blue-500 ring-1 ring-blue-500/30' : ''}
        />
        <p className="mt-1 text-[10px] text-gray-500 italic">
          Puedes seleccionar uno existente o escribir uno nuevo y pulsar Enter.
        </p>
      </div>
    </div>
  );
};

export default KinshipSelector;
