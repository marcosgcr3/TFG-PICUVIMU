import React, { useState } from 'react';
import SearchableSelect from '../common/SearchableSelect';

const SearchFilters = ({ 
  searchTerm, 
  setSearchTerm,
  availableColumns,
  searching,
  clearFilters,
  searchPersonas,
  onFiltersChange
}) => {
  // Estado para gestionar los filtros de atributos acumulativos
  const [activeFilters, setActiveFilters] = useState([]);
  const [newFilterAtributo, setNewFilterAtributo] = useState('');
  const [newFilterValue, setNewFilterValue] = useState('');
  const [newFilterFechaDesde, setNewFilterFechaDesde] = useState('');
  const [newFilterFechaHasta, setNewFilterFechaHasta] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Agregar un nuevo filtro de atributo
  const addFilter = () => {
    if (!newFilterAtributo) {
      alert('Debes seleccionar un atributo');
      return;
    }
    
    // Permitir añadir filtro solo con atributo (búsqueda por existencia)
    // o con cualquier combinación de valor/fechas
    
    const newFilter = {
      id: Date.now(), // ID único para cada filtro
      nombre_atributo: newFilterAtributo,
      valor: newFilterValue || null,
      fecha_desde: newFilterFechaDesde || null,
      fecha_hasta: newFilterFechaHasta || null
    };
    
    const updatedFilters = [...activeFilters, newFilter];
    setActiveFilters(updatedFilters);
    
    // Notificar cambio al componente padre (el efecto manejará la búsqueda)
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
    
    // Resetear campos del nuevo filtro
    setNewFilterAtributo('');
    setNewFilterValue('');
    setNewFilterFechaDesde('');
    setNewFilterFechaHasta('');
    setShowAdvancedOptions(false);
  };

  // Eliminar un filtro específico
  const removeFilter = (filterId) => {
    const updatedFilters = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updatedFilters);
    
    // Notificar cambio al componente padre (el efecto manejará la búsqueda)
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  // Obtener atributos disponibles que aún no están en uso
  const getAvailableAtributos = () => {
    const usedAtributos = activeFilters.map(f => f.nombre_atributo);
    return availableColumns.filter(col => !usedAtributos.includes(col));
  };

  // Función para obtener resumen legible del filtro
  const getFilterSummary = (filter) => {
    const parts = [];
    
    if (filter.valor) {
      parts.push(`Valor: "${filter.valor}"`);
    }
    
    if (filter.fecha_desde && filter.fecha_hasta) {
      parts.push(`Entre ${filter.fecha_desde} y ${filter.fecha_hasta}`);
    } else if (filter.fecha_desde) {
      parts.push(`Desde ${filter.fecha_desde}`);
    } else if (filter.fecha_hasta) {
      parts.push(`Hasta ${filter.fecha_hasta}`);
    }
    
    if (parts.length === 0) {
      return 'Existe este atributo';
    }
    
    return parts.join(' | ');
  };

  return (
    <div className="relative z-20 mb-6 p-6 bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700">
      <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-3">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtros de Búsqueda
      </h3>
      
      {/* Búsqueda por texto */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold text-gray-200 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Buscar por nombre o apellido:
        </label>
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Escribe nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Filtros por atributos con sistema acumulativo */}
      {availableColumns.length > 0 && (
        <div className="mb-4">
          <label className="block mb-3 font-semibold text-gray-200 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filtrar por atributos:
          </label>

          {/* Filtros activos */}
          {activeFilters.length > 0 && (
            <div className="mb-4 space-y-2">
              {activeFilters.map(filter => (
                <div key={filter.id} className="flex items-center gap-2 bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                  <div className="flex-1">
                    <div className="mb-1">
                      <span className="text-xs text-gray-400 font-medium">Atributo:</span>
                      <span className="text-white font-medium ml-2">{filter.nombre_atributo}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 font-medium">Criterio:</span>
                      <span className="text-blue-300 ml-2">{getFilterSummary(filter)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200"
                    title="Eliminar filtro"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Nuevo filtro */}
          {getAvailableAtributos().length > 0 && (
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <div className="space-y-3">
                {/* Selección de atributo */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">
                    Seleccionar atributo:
                  </label>
                  <SearchableSelect
                    options={getAvailableAtributos().map(atributo => ({ label: atributo, value: atributo }))}
                    value={newFilterAtributo}
                    onChange={(val) => {
                      setNewFilterAtributo(val);
                      setShowAdvancedOptions(false);
                      if (val && onFiltersChange) {
                        onFiltersChange([...activeFilters, {
                          id: 'preview',
                          nombre_atributo: val,
                          valor: null
                        }]);
                      } else if (!val && onFiltersChange) {
                        onFiltersChange(activeFilters);
                      }
                    }}
                    placeholder="-- Selecciona un atributo --"
                  />
                </div>

                {newFilterAtributo && (
                  <>
                    {/* Valor del atributo */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block font-medium">
                        Valor (opcional):
                      </label>
                      <input
                        type="text"
                        placeholder="Deja vacío para buscar solo existencia del atributo"
                        value={newFilterValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewFilterValue(val);
                          if (newFilterAtributo && onFiltersChange) {
                            onFiltersChange([...activeFilters, {
                              id: 'preview',
                              nombre_atributo: newFilterAtributo,
                              valor: val || null
                            }]);
                          }
                        }}
                        className="w-full px-3 py-2.5 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                      />
                    </div>

                    {/* Botón para mostrar opciones avanzadas */}
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {showAdvancedOptions ? 'Ocultar' : 'Mostrar'} filtros por fecha
                    </button>

                    {/* Filtros por fecha (opciones avanzadas) */}
                    {showAdvancedOptions && (
                      <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600 space-y-3">
                        <div className="text-xs text-gray-300 mb-2">
                          Nota:  Puedes usar solo año (YYYY) o fecha completa (DD-MM-YYYY)
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
                              Fecha desde:
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 2020 o 01-01-2020"
                              value={newFilterFechaDesde}
                              onChange={(e) => setNewFilterFechaDesde(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                            />
                          </div>
                          
                          <div>
                            <label className="text-xs text-gray-400 mb-1.5 block font-medium">
                              Fecha hasta:
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 2023 o 31-12-2023"
                              value={newFilterFechaHasta}
                              onChange={(e) => setNewFilterFechaHasta(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botón añadir */}
                    <div className="flex justify-end">
                      <button
                        onClick={addFilter}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Añadir Filtro
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {getAvailableAtributos().length === 0 && activeFilters.length > 0 && (
            <div className="bg-blue-600/20 border border-blue-500/30 text-blue-300 p-3 rounded-lg text-sm">
              Info:  Ya has añadido filtros para todos los atributos disponibles
            </div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 items-center flex-wrap">
        <button
          onClick={clearFilters}
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Limpiar Filtros
        </button>
        
        <button
          onClick={searchPersonas}
          disabled={searching}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-md ${
            searching 
              ? 'bg-gray-500 cursor-not-allowed text-gray-300' 
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {searching ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Buscando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar Ahora
            </>
          )}
        </button>

        {/* Indicador de filtros activos */}
        {(searchTerm || activeFilters.length > 0) && (
          <div className="ml-auto flex items-center gap-2 bg-blue-600/20 px-4 py-2 rounded-lg border border-blue-500/30">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-400 font-medium">
              {activeFilters.length > 0 ? `${activeFilters.length} filtro${activeFilters.length > 1 ? 's' : ''} activo${activeFilters.length > 1 ? 's' : ''}` : 'Filtros activos'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
