import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Seleccionar...", 
  label,
  disabled = false,
  isCreatable = false,
  className = "",
  containerClassName = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  const lastClosedTimeRef = useRef(0);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const isMatch = (val1, val2) => {
    if (val1 === undefined || val1 === null || val2 === undefined || val2 === null) {
      return val1 === val2;
    }
    return String(val1) === String(val2);
  };

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => isMatch(opt.value, value)) || (isCreatable && value ? { label: value, value } : null);

  const handleSelect = (val) => {
    lastClosedTimeRef.current = Date.now();
    setIsOpen(false);
    setSearchTerm('');
    onChange(val);
  };

  return (
    <div ref={wrapperRef} className={`relative ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}
      
      <div 
        onMouseDown={(e) => {
          if (disabled) return;
          e.preventDefault();
          
          // Prevenir reapertura accidental inmediata (ghost click / touch retargeting)
          const now = Date.now();
          if (now - lastClosedTimeRef.current < 800) {
            return;
          }
          
          setIsOpen(!isOpen);
        }}
        onTouchStart={(e) => {
          if (disabled) return;
          e.preventDefault();
          e.stopPropagation();
          
          // Prevenir reapertura accidental inmediata (ghost click / touch retargeting)
          const now = Date.now();
          if (now - lastClosedTimeRef.current < 800) {
            return;
          }
          
          setIsOpen(!isOpen);
        }}
        className={`
          flex items-center justify-between w-full px-3 py-2 
          bg-gray-800 border border-gray-600 rounded cursor-pointer
          text-sm text-white transition-all
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'hover:border-gray-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <X 
              size={14} 
              className="text-gray-400 hover:text-white" 
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onChange('');
                setSearchTerm('');
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onChange('');
                setSearchTerm('');
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-gray-700 flex items-center gap-2 bg-gray-900/50">
            <Search size={14} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isCreatable && searchTerm && filteredOptions.length === 0) {
                  handleSelect(searchTerm);
                }
              }}
              className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                  className={`
                    px-3 py-2 text-sm cursor-pointer transition-colors
                    ${isMatch(value, option.value) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                  `}
                >
                  {option.label}
                  {option.subtitle && (
                    <span className={`block text-[10px] ${isMatch(value, option.value) ? 'text-blue-100' : 'text-gray-500'}`}>
                      {option.subtitle}
                    </span>
                  )}
                </div>
              ))
            ) : isCreatable && searchTerm ? (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(searchTerm);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(searchTerm);
                }}
                className="px-3 py-3 text-sm cursor-pointer bg-blue-900/30 text-blue-300 hover:bg-blue-800/50 transition-colors border-t border-blue-800/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-lg">+</span>
                  <span>Crear nuevo: <strong>"{searchTerm}"</strong></span>
                </div>
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-gray-500 text-xs italic">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
