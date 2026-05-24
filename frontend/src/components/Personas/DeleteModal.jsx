import React from 'react';

const DeleteModal = ({ persona, onConfirm, onCancel }) => {
  if (!persona) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[1000]">
      <div className="bg-gray-800 border-2 border-gray-700 p-8 rounded-2xl shadow-2xl max-w-md mx-4 text-center">
        {/* Icono de advertencia */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-600/20 rounded-full p-4">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <h3 className="mb-4 text-xl font-bold text-white">
          ¿Confirmar eliminación?
        </h3>
        <p className="mb-6 text-gray-300 leading-relaxed">
          ¿Estás seguro de que quieres eliminar a{' '}
          <strong className="text-white">{persona.Nombre} {persona.Apellidos}</strong>?
          <br />
          <br />
          <span className="text-red-400 text-sm">
            Esta acción eliminará la persona y todas sus relaciones de forma permanente.
          </span>
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-600 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
