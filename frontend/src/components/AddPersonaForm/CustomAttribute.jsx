import React from 'react';
import SearchableSelect from '../common/SearchableSelect';
import KinshipSelector from '../Personas/KinshipSelector';
import kinshipCategories from '../../data/kinship_categories.json';

const CustomAttribute = ({ 
  attr, 
  index, 
  allPersonas,
  suggestions,
  onTypeChange,
  onValueChange,
  onRemove,
  onSelectSuggestion,
  onRelacionChange
}) => {
  return (
    <div className="bg-gray-700/50 p-4 rounded-xl border-2 border-gray-600 space-y-3">
      {attr.type === 'RELACION' ? (
        <div className="space-y-3">
          {/* Parentesco / Relación */}
          <div className="relative">
            <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Parentesco / Relación</label>
            <KinshipSelector
              value={attr.name || ''}
              onChange={(val) => {
                onSelectSuggestion(index, val);
                // Determinar si es familiar o no
                const isFamiliar = Object.values(kinshipCategories).some(rels =>
                  rels.some(r => r.name === val)
                );
                onRelacionChange(index, 'categoria', isFamiliar ? 'familiar' : 'otro');
              }}
              tiposRelaciones={suggestions || []}
              categoria={attr.categoria || 'familiar'}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Campo de nombre con SearchableSelect */}
          <div>
            <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-1.5">Nombre del atributo</label>
            <SearchableSelect
              options={suggestions ? suggestions.map(s => ({ label: s, value: s })) : []}
              value={attr.name || ''}
              onChange={(val) => onSelectSuggestion(index, val)}
              placeholder="ej: Ocupación, Residencia..."
              isCreatable={true}
            />
          </div>
        </div>
      )}
      
      {/* Campo de valor según el tipo */}
      {attr.type === 'DATE' ? (
        <input
          type="date"
          value={attr.value}
          onChange={(e) => onValueChange(index, 'value', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
        />
      ) : attr.type === 'RELACION' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Categoría de relación:</label>
            <SearchableSelect
              options={[
                { label: 'Familiar', value: 'familiar' },
                { label: 'Otro', value: 'otro' }
              ]}
              value={attr.categoria || 'familiar'}
              onChange={(val) => onRelacionChange(index, 'categoria', val)}
              placeholder="Seleccionar..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Persona existente:</label>
            <SearchableSelect
              options={allPersonas ? allPersonas.map(persona => ({ 
                label: `${persona.Nombre} ${persona.Apellidos}`, 
                value: persona.id.toString(),
                subtitle: `ID: ${persona.id}`
              })) : []}
              value={attr.personaRelacionadaId?.toString() || ''}
              onChange={(val) => onRelacionChange(index, 'personaRelacionadaId', val ? parseInt(val) : null)}
              placeholder="-- Seleccionar persona --"
            />
          </div>
          
          <div className="text-center text-sm font-medium text-gray-400">O crear nueva persona</div>
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={attr.nombreNuevo || ''}
              onChange={(e) => onRelacionChange(index, 'nombreNuevo', e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
            />
            <input
              type="text"
              placeholder="Apellido"
              value={attr.apellidoNuevo || ''}
              onChange={(e) => onRelacionChange(index, 'apellidoNuevo', e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Género <span className="text-red-400">*</span>:</label>
            <SearchableSelect
              options={[
                { label: 'Masculino', value: 'M' },
                { label: 'Femenino', value: 'F' }
              ]}
              value={attr.generoNuevo || ''}
              onChange={(val) => onRelacionChange(index, 'generoNuevo', val || null)}
              placeholder="-- Seleccionar género --"
            />
          </div>

          {/* Biografía para nueva persona */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-600">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider">Nacimiento</label>
              <input
                type="text"
                placeholder="DD-MM-YYYY (ej: 00-00-1900)"
                value={attr.fechaNacNuevo || ''}
                onChange={(e) => onRelacionChange(index, 'fechaNacNuevo', e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-white text-xs placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="Lugar de nacimiento"
                value={attr.lugarNacNuevo || ''}
                onChange={(e) => onRelacionChange(index, 'lugarNacNuevo', e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-white text-xs placeholder-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-red-400 uppercase tracking-wider">Defunción</label>
              <input
                type="text"
                placeholder="DD-MM-YYYY (ej: 00-00-1950)"
                value={attr.fechaDefNuevo || ''}
                onChange={(e) => onRelacionChange(index, 'fechaDefNuevo', e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-white text-xs placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="Lugar de defunción"
                value={attr.lugarDefNuevo || ''}
                onChange={(e) => onRelacionChange(index, 'lugarDefNuevo', e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-white text-xs placeholder-gray-500"
              />
            </div>
          </div>
          <p className="text-[10px] text-gray-500 italic">Nota:  Usa 00 para partes desconocidas: 00-00-1900 (solo año)</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Valor principal */}
          <div className="flex gap-2">
            <input
              type={attr.type === 'INTEGER' || attr.type === 'REAL' ? 'number' : 'text'}
              step={attr.type === 'REAL' ? '0.01' : '1'}
              value={attr.value}
              onChange={(e) => onValueChange(index, 'value', e.target.value)}
              placeholder={`Valor ${attr.type === 'INTEGER' ? 'numérico' : attr.type === 'REAL' ? 'decimal' : 'del atributo'}`}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              ✕
            </button>
          </div>

          {/* Fechas opcionales */}
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
            <div className="text-xs font-medium text-gray-400 mb-2">📅 Fechas (opcional) - Formato: DD-MM-YYYY</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Inicio</label>
                <input
                  type="text"
                  value={attr.fecha_inicio || ''}
                  onChange={(e) => onValueChange(index, 'fecha_inicio', e.target.value)}
                  placeholder="00-00-2005"
                  className="w-full px-3 py-1.5 text-sm rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Fin</label>
                <input
                  type="text"
                  value={attr.fecha_fin || ''}
                  onChange={(e) => onValueChange(index, 'fecha_fin', e.target.value)}
                  placeholder="00-00-2010"
                  className="w-full px-3 py-1.5 text-sm rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 italic">
              Nota:  Usa 00 para fechas parciales: 00-00-2005 (solo año), 00-03-2005 (mes/año)
            </div>
          </div>

          {/* Notas opcionales */}
          <div>
            <textarea
              value={attr.notas || ''}
              onChange={(e) => onValueChange(index, 'notas', e.target.value)}
              placeholder="Notas adicionales (opcional)"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none resize-none"
            />
          </div>
        </div>
      )}
      
      {attr.type === 'RELACION' && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          ✕ Eliminar Relación
        </button>
      )}
    </div>
  );
};

export default CustomAttribute;
