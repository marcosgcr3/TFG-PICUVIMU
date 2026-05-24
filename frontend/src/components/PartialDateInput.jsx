import React, { useState, useEffect } from 'react';

/**
 * Componente para input de fechas parciales
 * Permite ingresar: DD-MM-YYYY, 00-MM-YYYY (solo mes/año), 00-00-YYYY (solo año)
 */
const PartialDateInput = ({ value, onChange, label, placeholder }) => {
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Parsear valor inicial si existe
  useEffect(() => {
    if (value && value.includes('-')) {
      const parts = value.split('-');
      setDia(parts[0] || '00');
      setMes(parts[1] || '00');
      setAnio(parts[2] || '');
      setShowAdvanced(parts[0] === '00' || parts[1] === '00');
    }
  }, [value]);

  // Actualizar valor en formato DD-MM-YYYY
  const updateValue = (newDia, newMes, newAnio) => {
    if (newAnio && newAnio.length === 4) {
      const diaStr = newDia && newDia !== '00' ? newDia.padStart(2, '0') : '00';
      const mesStr = newMes && newMes !== '00' ? newMes.padStart(2, '0') : '00';
      onChange(`${diaStr}-${mesStr}-${newAnio}`);
    } else if (!newAnio && !newMes && !newDia) {
      onChange('');
    }
  };

  const handleDiaChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2);
    if (val && parseInt(val) > 31) val = '31';
    setDia(val);
    updateValue(val, mes, anio);
  };

  const handleMesChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2);
    if (val && parseInt(val) > 12) val = '12';
    setMes(val);
    updateValue(dia, val, anio);
  };

  const handleAnioChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    setAnio(val);
    updateValue(dia, mes, val);
  };

  const handleClear = () => {
    setDia('');
    setMes('');
    setAnio('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          {showAdvanced ? 'Vista simple' : 'Fecha parcial'}
        </button>
      </div>

      {showAdvanced ? (
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="text"
                value={dia}
                onChange={handleDiaChange}
                placeholder="DD"
                maxLength={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 text-center mt-1">Día</div>
            </div>
            <span className="text-gray-400 text-xl">-</span>
            <div className="flex-1">
              <input
                type="text"
                value={mes}
                onChange={handleMesChange}
                placeholder="MM"
                maxLength={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 text-center mt-1">Mes</div>
            </div>
            <span className="text-gray-400 text-xl">-</span>
            <div className="flex-1">
              <input
                type="text"
                value={anio}
                onChange={handleAnioChange}
                placeholder="YYYY"
                maxLength={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 text-center mt-1">Año</div>
            </div>
            {(dia || mes || anio) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-red-400 hover:text-red-300 p-2"
                title="Limpiar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="text-xs text-gray-400 bg-gray-800/50 rounded p-2">
            Nota:  Dejar en 00 para fechas parciales: <br/>
            • Solo año: 00-00-2005 <br/>
            • Mes y año: 00-03-2005 <br/>
            • Fecha completa: 15-03-2005
          </div>
        </div>
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'DD-MM-YYYY'}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  );
};

export default PartialDateInput;
