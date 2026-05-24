import React from 'react';
import SearchableSelect from '../common/SearchableSelect';

const BasicFields = ({ nombre, primerApellido, genero, onNombreChange, onApellidoChange, onGeneroChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-semibold text-gray-200 mb-2">
          Nombre <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          placeholder="Ingresa el nombre"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
          required
        />
      </div>
      
      <div>
        <label htmlFor="primerApellido" className="block text-sm font-semibold text-gray-200 mb-2">
          Apellidos <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="primerApellido"
          value={primerApellido}
          onChange={(e) => onApellidoChange(e.target.value)}
          placeholder="Ingresa los apellidos"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
          required
        />
      </div>

      <div>
        <label htmlFor="genero" className="block text-sm font-semibold text-gray-200 mb-2">
          Género <span className="text-red-400">*</span>
        </label>
        <SearchableSelect
          options={[
            { label: 'Masculino', value: 'M' },
            { label: 'Femenino', value: 'F' }
          ]}
          value={genero}
          onChange={(val) => onGeneroChange(val)}
          placeholder="Selecciona género"
        />
      </div>
    </div>
  );
};

export default BasicFields;
