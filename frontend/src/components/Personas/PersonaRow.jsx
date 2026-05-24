import React from 'react';

const PersonaRow = ({ persona, index, totalPersonas, onEdit, onDelete, onView }) => {
  return (
    <div 
      onClick={() => onView(persona)}
      className={`flex items-center px-4 py-3 transition-all duration-200 cursor-pointer ${
        index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/50'
      } ${index < totalPersonas - 1 ? 'border-b border-gray-700' : ''} hover:bg-gray-700/50`}
    >
      <div className="flex-[0_0_80px] text-center font-bold text-blue-400">
        {index + 1}
      </div>
      
      {/* Nombre */}
      <div className="flex-1 pl-4 text-gray-200">
        {persona.Nombre}
      </div>
      
      {/* Apellido */}
      <div className="flex-1 pl-4 text-gray-200">
        {persona.Apellidos}
      </div>
      
      {/* Botones de acción */}
      <div className="flex-[0_0_140px] flex justify-center gap-2">
        {/* Botón de edición */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(persona);
          }}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
          title={`Editar ${persona.Nombre} ${persona.Apellidos}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-sm font-medium">Editar</span>
        </button>
        
        {/* Botón de eliminación */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(persona);
          }}
          className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
          title={`Eliminar ${persona.Nombre} ${persona.Apellidos}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-sm font-medium">Eliminar</span>
        </button>
      </div>
    </div>
  );
};

export default PersonaRow;
