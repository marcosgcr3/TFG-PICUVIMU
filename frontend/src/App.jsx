import React, { useState, useEffect } from 'react';
import './App.css';

import Personas from './components/Personas';
import ChatBot from './components/ChatBot';
import RelationGraph from './components/RelationGraph';
import PersonaInfo from './components/Personas/PersonaInfo';

const App = () => {
  const [currentView, setCurrentView] = useState('personas'); // 'personas' o 'graph'
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);
  const [selectedPersonaData, setSelectedPersonaData] = useState(null);
  const [showPersonaInfo, setShowPersonaInfo] = useState(false);

  const handleViewPersona = (persona) => {
    setSelectedPersonaData(persona);
    setShowPersonaInfo(true);
  };

  const handleCloseModal = () => {
    setShowPersonaInfo(false);
    setSelectedPersonaData(null);
  };

  const handleViewInGraph = (personaId) => {
    setSelectedPersonaId(personaId);
    setCurrentView('graph');
    setShowPersonaInfo(false);
  };

  // Reset selectedPersonaId when leaving graph view
  useEffect(() => {
    if (currentView !== 'graph') {
      setSelectedPersonaId(null);
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-gray-900">
      <ChatBot />
      
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 py-8 px-6 text-center shadow-xl">
        <h1 className="text-6xl font-bold text-white mb-4 animate-fade-in">PICUVIMU</h1>
        
        <div className="flex gap-4 justify-center items-center flex-wrap">
          {/* Navegación */}
          <div className="flex gap-2 bg-gray-700/50 rounded-xl p-1">
            <button
              onClick={() => setCurrentView('personas')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                currentView === 'personas'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Lista de Personas
            </button>
            <button
              onClick={() => setCurrentView('graph')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                currentView === 'graph'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Grafo de Relaciones
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-fade-in">
          {currentView === 'personas' ? (
            <Personas onViewPersona={handleViewPersona} />
          ) : (
            <RelationGraph 
              initialPersonaId={selectedPersonaId} 
              onViewPersona={handleViewPersona} 
            />
          )}
        </div>
      </main>

      {/* Modal Global de Información de Persona */}
      {showPersonaInfo && selectedPersonaData && (
        <PersonaInfo
          persona={selectedPersonaData}
          onClose={handleCloseModal}
          onViewInGraph={handleViewInGraph}
        />
      )}
    </div>
  );
};

export default App;