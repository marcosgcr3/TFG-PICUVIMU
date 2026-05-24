import React, { useState, useEffect } from 'react';
import api from '../api';
import { validatePartialDate } from '../utils/dateValidation';
import { autoCorrectRelationship } from '../utils/kinshipUtils';
import BasicFields from './AddPersonaForm/BasicFields';
import CustomAttribute from './AddPersonaForm/CustomAttribute';

const AddPersonaForm = ({ addPersona, adding = false }) => {
  const [nombre, setNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [genero, setGenero] = useState(null);
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [lugarNacimiento, setLugarNacimiento] = useState('');
  const [fechaDefuncion, setFechaDefuncion] = useState('');
  const [lugarDefuncion, setLugarDefuncion] = useState('');
  const [customAttributes, setCustomAttributes] = useState([]);
  const [allPersonas, setAllPersonas] = useState([]);
  const [tiposRelaciones, setTiposRelaciones] = useState([]);
  const [availableAtributos, setAvailableAtributos] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    if (genero) {
      setCustomAttributes(prev => prev.map(attr => {
        if (attr.type === 'RELACION' && attr.name) {
          return { ...attr, name: autoCorrectRelationship(attr.name, genero) };
        }
        return attr;
      }));
    }
  }, [genero]);

  const addCustomAttribute = () => {
    const newAttribute = { 
      name: '', 
      value: '', 
      type: 'TEXT', 
      input: 'text',
      fecha_inicio: '',
      fecha_fin: '',
      notas: ''
    };
    setCustomAttributes([...customAttributes, newAttribute]);
  };

  const addCustomRelation = () => {
    const newRelation = {
      name: '',
      value: '',
      type: 'RELACION',
      categoria: 'familiar',
      personaRelacionadaId: null,
      nombreNuevo: '',
      apellidoNuevo: '',
      generoNuevo: '',
      fechaNacNuevo: '',
      lugarNacNuevo: '',
      fechaDefNuevo: '',
      lugarDefNuevo: ''
    };
    setCustomAttributes([...customAttributes, newRelation]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagenes(prev => [...prev, { 
          nombre_imagen: '', 
          imagen_data: base64String,
          preview: base64String 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateImageName = (index, name) => {
    const newImagenes = [...imagenes];
    newImagenes[index].nombre_imagen = name;
    setImagenes(newImagenes);
  };

  const updateImageFuente = (index, fuente) => {
    const newImagenes = [...imagenes];
    newImagenes[index].fuente = fuente;
    setImagenes(newImagenes);
  };

  const removeImage = (index) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  const loadAllPersonas = async () => {
    try {
      const response = await api.get('/personas/');
      setAllPersonas(response.data);
    } catch (error) {
      console.error('Error cargando personas:', error);
    }
  };

  const loadTiposRelaciones = async (categoria = null) => {
    try {
      const url = categoria ? `/relaciones/tipos/?categoria=${categoria}` : '/relaciones/tipos/';
      const response = await api.get(url);
      setTiposRelaciones(response.data.tipos_relaciones || []);
    } catch (error) {
      console.error('Error cargando tipos de relaciones:', error);
      setTiposRelaciones([]);
    }
  };

  const loadAvailableAtributos = async () => {
    try {
      const response = await api.get('/personas/atributos/nombres/');
      const attributes = response.data.atributos || [];
      const filtered = attributes.filter(n => {
        const norm = n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        return norm !== 'nacimiento' && norm !== 'defuncion';
      });
      setAvailableAtributos(filtered);
    } catch (error) {
      console.error('Error cargando nombres de atributos:', error);
      setAvailableAtributos([]);
    }
  };

  const getAllAvailableNames = () => {
    return Array.from(new Set([
      ...availableAtributos,
      ...tiposRelaciones
    ])).filter(n => {
      const norm = n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
      return norm !== 'nacimiento' && norm !== 'defuncion';
    });
  };

  const selectSuggestion = (index, suggestion) => {
    const suggestedType = getSuggestedType(suggestion);
    
    setCustomAttributes(prevAttributes => {
      const newAttributes = [...prevAttributes];
      const attribute = {...newAttributes[index]};
      
      let finalSuggestion = suggestion;
      if (suggestedType === 'RELACION' || attribute.type === 'RELACION') {
        finalSuggestion = autoCorrectRelationship(suggestion, genero);
      }
      
      attribute.name = finalSuggestion;
      if (suggestedType) {
        attribute.type = suggestedType;
        attribute.input = suggestedType === 'DATE' ? 'date' : 'text';
      }
      newAttributes[index] = attribute;
      return newAttributes;
    });
  };

  const getSuggestedType = (attributeName) => {
    const name = attributeName.toLowerCase();
    
    const relacionesArray = Array.isArray(tiposRelaciones) ? tiposRelaciones : [];
    if (relacionesArray.some(tipo => tipo.toLowerCase() === name)) {
      return 'RELACION';
    }
    
    if (name.includes('hijo') || name.includes('hija') || name.includes('padre') || 
        name.includes('madre') || name.includes('esposo') || name.includes('esposa') ||
        name.includes('hermano') || name.includes('hermana') || name.includes('primo') ||
        name.includes('prima') || name.includes('tio') || name.includes('tia') ||
        name.includes('abuelo') || name.includes('abuela') || name.includes('nieto') ||
        name.includes('nieta') || name.includes('sobrino') || name.includes('sobrina') ||
        name.includes(' de') || name.includes('pareja') || name.includes('conyuge')) {
      return 'RELACION';
    }
    
    if (name.includes('fecha') || name.includes('date') || 
        name.includes('nacimiento') || name.includes('ingreso') ||
        name.includes('creacion') || name.includes('actualizacion')) {
      return 'DATE';
    }
    
    if (name.includes('edad') || name.includes('ano') || name.includes('year') ||
        name.includes('cantidad') || name.includes('numero') || name.includes('id')) {
      return 'INTEGER';
    }
    
    if (name.includes('precio') || name.includes('salario') || name.includes('peso') ||
        name.includes('altura') || name.includes('porcentaje') || name.includes('ratio')) {
      return 'REAL';
    }
    
    return 'TEXT';
  };

  useEffect(() => {
    loadTiposRelaciones();
    loadAllPersonas();
    loadAvailableAtributos();
  }, []);

  const removeCustomAttribute = (index) => {
    const newAttributes = customAttributes.filter((_, i) => i !== index);
    setCustomAttributes(newAttributes);
  };

  const updateCustomAttribute = (index, field, value) => {
    const newAttributes = [...customAttributes];
    const attribute = {...newAttributes[index], [field]: value};
    
    if (field === 'type') {
      if (value === 'DATE') {
        attribute.input = 'date';
      } else if (value === 'RELACION') {
        attribute.input = 'relacion';
        loadAllPersonas();
        loadTiposRelaciones();
      } else {
        attribute.input = 'text';
      }
      attribute.value = '';
      attribute.personaRelacionadaId = null;
      attribute.nombreNuevo = '';
      attribute.apellidoNuevo = '';
      attribute.generoNuevo = '';
    }
    
    if (field === 'name') {
      getSuggestions(value, index);
    }
    
    newAttributes[index] = attribute;
    setCustomAttributes(newAttributes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!genero) {
      alert('Por favor, selecciona un género (Masculino o Femenino)');
      return;
    }
    if (nombre.trim() && primerApellido.trim() && !adding) {
      // Ojo: Nos aseguramos de que cualquier nueva persona de parentesco tenga asignado un género
      const customRelacionesSinGenero = customAttributes.filter(attr => attr.type === 'RELACION' && (attr.nombreNuevo || attr.apellidoNuevo) && !attr.generoNuevo);
      if (customRelacionesSinGenero.length > 0) {
        alert('Por favor, selecciona un género para todas las nuevas personas creadas en los atributos.');
        return;
      }

      const relaciones = [];
      const atributos = [];

      // Validamos e insertamos el Nacimiento de forma manual
      if (fechaNacimiento || lugarNacimiento) {
        if (fechaNacimiento) {
          const v = validatePartialDate(fechaNacimiento);
          if (!v.isValid) {
            alert(`Fecha de Nacimiento inválida: ${v.error}`);
            return;
          }
        }
        atributos.push({
          nombre_atributo: "Nacimiento",
          valor: lugarNacimiento.trim() || "Desconocido",
          fecha_inicio: fechaNacimiento || null
        });
      }

      // Validamos e insertamos la Defunción
      if (fechaDefuncion || lugarDefuncion) {
        if (fechaDefuncion) {
          const v = validatePartialDate(fechaDefuncion);
          if (!v.isValid) {
            alert(`Fecha de Defunción inválida: ${v.error}`);
            return;
          }
        }
        atributos.push({
          nombre_atributo: "Defunción",
          valor: lugarDefuncion.trim() || "Desconocido",
          fecha_inicio: fechaDefuncion || null
        });
      }

      for (const attr of customAttributes) {
        if (attr.name.trim()) {
          const nombreAtributo = attr.name.trim();
          const norm = nombreAtributo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          if (norm === 'nacimiento' || norm === 'defuncion') {
            alert(`No puedes añadir el atributo "${nombreAtributo}" como personalizado. Usa la sección de Información Biográfica en la parte superior.`);
            return;
          }
          
          if (attr.type === 'RELACION') {
            // Guardamos la relación según si es una persona que ya existe o una nueva
            if (attr.personaRelacionadaId) {
              relaciones.push({
                tipo_relacion: nombreAtributo,
                categoria: attr.categoria || 'familiar',
                persona_relacionada_id: attr.personaRelacionadaId
              });
            } else if (attr.nombreNuevo && attr.apellidoNuevo) {
              relaciones.push({
                tipo_relacion: nombreAtributo,
                categoria: attr.categoria || 'familiar',
                nombre_nuevo: attr.nombreNuevo,
                apellido_nuevo: attr.apellidoNuevo,
                genero_nuevo: attr.generoNuevo || null,
                fecha_nac_nuevo: attr.fechaNacNuevo,
                lugar_nac_nuevo: attr.lugarNacNuevo,
                fecha_def_nuevo: attr.fechaDefNuevo,
                lugar_def_nuevo: attr.lugarDefNuevo
              });
            }
          } else if (attr.value && attr.value.trim()) {
            // Validamos las fechas de atributos personalizados si se han proporcionado
            const startVal = validatePartialDate(attr.fecha_inicio);
            const endVal = validatePartialDate(attr.fecha_fin);
            
            if (!startVal.isValid) {
              alert(`Error en fecha de inicio del atributo "${nombreAtributo}": ${startVal.error}`);
              return;
            }
            if (!endVal.isValid) {
              alert(`Error en fecha de fin del atributo "${nombreAtributo}": ${endVal.error}`);
              return;
            }

            // Guardamos los atributos dinámicos
            atributos.push({
              nombre_atributo: nombreAtributo,
              valor: attr.value.trim(),
              fecha_inicio: attr.fecha_inicio || null,
              fecha_fin: attr.fecha_fin || null,
              notas: attr.notas || null
            });
          }
        }
      }

      try {
        // Primero registramos la persona básica
        const personaResponse = await addPersona({ 
          Nombre: nombre.trim(), 
          Apellidos: primerApellido.trim(),
          Genero: genero
        });
        
        if (personaResponse && personaResponse.id) {
          // Luego creamos todos los atributos en cascada
          for (const atributo of atributos) {
            await api.post(`/personas/${personaResponse.id}/atributos/`, atributo);
          }
          
          // Creamos los parentescos o relaciones familiares
          for (const relacion of relaciones) {
            try {
              await api.post(`/personas/${personaResponse.id}/relaciones/`, relacion);
            } catch (err) {
              const errorMsg = err.response?.data?.detail || "Error al crear la relación";
              alert(errorMsg);
            }
          }
          
          // Y por último subimos las fotos de retrato si las hay
          for (const imagen of imagenes) {
            try {
              await api.post(`/personas/${personaResponse.id}/imagenes/`, {
                nombre_imagen: imagen.nombre_imagen.trim() || 'Imagen',
                imagen_data: imagen.imagen_data,
                fuente: imagen.fuente || ''
              });
            } catch (err) {
              console.error('Error subiendo imagen:', err);
            }
          }
        }
        
        setNombre('');
        setPrimerApellido('');
        setGenero(null);
        setFechaNacimiento('');
        setLugarNacimiento('');
        setFechaDefuncion('');
        setLugarDefuncion('');
        setCustomAttributes([]);
        setImagenes([]);
        setIsExpanded(false);
        
      } catch (error) {
        console.error('Error creating person with custom attributes:', error);
        alert('Error al crear persona: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700 transition-all duration-300">
      {/* Header expandible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-4 flex items-center justify-between transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Añadir Nueva Persona</h3>
        </div>
        <svg 
          className={`w-6 h-6 text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Formulario */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="p-6 space-y-6 animate-fade-in">
          {/* Campos básicos usando componente */}
          <BasicFields
            nombre={nombre}
            primerApellido={primerApellido}
            genero={genero}
            onNombreChange={setNombre}
            onApellidoChange={setPrimerApellido}
            onGeneroChange={setGenero}
          />

          {/* Información Biográfica Principal */}
          <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-200 font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Información Biográfica
              </h4>
              <div className="text-[10px] text-gray-400 bg-gray-800 px-2 py-1 rounded-md border border-gray-600 max-w-[250px]">
                Nota:  Usa <code className="text-purple-300">00</code> para datos desconocidos (Ej: <code className="text-purple-300">00-00-1900</code> para solo el año).
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="text-blue-400 text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                  Nacimiento
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    placeholder="Fecha (DD-MM-YYYY)"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <input
                    type="text"
                    value={lugarNacimiento}
                    onChange={(e) => setLugarNacimiento(e.target.value)}
                    placeholder="Lugar de nacimiento"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-red-400 text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                  Defunción
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    value={fechaDefuncion}
                    onChange={(e) => setFechaDefuncion(e.target.value)}
                    placeholder="Fecha (DD-MM-YYYY)"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-red-500 outline-none transition-all"
                  />
                  <input
                    type="text"
                    value={lugarDefuncion}
                    onChange={(e) => setLugarDefuncion(e.target.value)}
                    placeholder="Lugar de defunción"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Atributos personalizados */}
          <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-200 font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Atributos Personalizados
                {customAttributes.filter(attr => attr.type !== 'RELACION').length > 0 && (
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                    {customAttributes.filter(attr => attr.type !== 'RELACION').length}
                  </span>
                )}
              </h4>
              <button
                type="button"
                onClick={addCustomAttribute}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir Atributo
              </button>
            </div>

            {customAttributes.filter(attr => attr.type !== 'RELACION').length === 0 ? (
              <p className="text-gray-400 italic text-sm text-center py-4 bg-gray-800/30 rounded-lg border border-dashed border-gray-600">
                No hay atributos personalizados añadidos.
              </p>
            ) : (
              <div className="space-y-3">
                {customAttributes.map((attr, index) => {
                  if (attr.type === 'RELACION') return null;
                  return (
                    <CustomAttribute
                      key={index}
                      attr={attr}
                      index={index}
                      allPersonas={allPersonas}
                      suggestions={availableAtributos}
                      onNameChange={(idx, value) => updateCustomAttribute(idx, 'name', value)}
                      onTypeChange={(idx, value) => updateCustomAttribute(idx, 'type', value)}
                      onValueChange={(idx, field, value) => updateCustomAttribute(idx, field, value)}
                      onRemove={removeCustomAttribute}
                      onSelectSuggestion={selectSuggestion}
                      onRelacionChange={(idx, field, value) => {
                        setCustomAttributes(prevAttributes => {
                          const newAttributes = [...prevAttributes];
                          newAttributes[idx] = {
                            ...newAttributes[idx],
                            [field]: value
                          };
                          return newAttributes;
                        });
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Relaciones personalizadas */}
          <div className="p-4 bg-gray-700/50 rounded-xl border border-gray-600 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-200 font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Relaciones Personalizadas
                {customAttributes.filter(attr => attr.type === 'RELACION').length > 0 && (
                  <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                    {customAttributes.filter(attr => attr.type === 'RELACION').length}
                  </span>
                )}
              </h4>
              <button
                type="button"
                onClick={addCustomRelation}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir Relación
              </button>
            </div>

            {customAttributes.filter(attr => attr.type === 'RELACION').length === 0 ? (
              <p className="text-gray-400 italic text-sm text-center py-4 bg-gray-800/30 rounded-lg border border-dashed border-gray-600">
                No hay relaciones personalizadas añadidas.
              </p>
            ) : (
              <div className="space-y-3">
                {customAttributes.map((attr, index) => {
                  if (attr.type !== 'RELACION') return null;
                  return (
                    <CustomAttribute
                      key={index}
                      attr={attr}
                      index={index}
                      allPersonas={allPersonas}
                      suggestions={tiposRelaciones}
                      onNameChange={(idx, value) => updateCustomAttribute(idx, 'name', value)}
                      onTypeChange={(idx, value) => updateCustomAttribute(idx, 'type', value)}
                      onValueChange={(idx, field, value) => updateCustomAttribute(idx, field, value)}
                      onRemove={removeCustomAttribute}
                      onSelectSuggestion={selectSuggestion}
                      onRelacionChange={(idx, field, value) => {
                        setCustomAttributes(prevAttributes => {
                          const newAttributes = [...prevAttributes];
                          let finalValue = value;
                          if (field === 'name') {
                            finalValue = autoCorrectRelationship(value, genero);
                          }
                          newAttributes[idx] = {
                            ...newAttributes[idx],
                            [field]: finalValue,
                            ...(field === 'personaRelacionadaId' && value ? { nombreNuevo: '', apellidoNuevo: '' } : {}),
                            ...(field === 'nombreNuevo' || field === 'apellidoNuevo' ? { personaRelacionadaId: null } : {})
                          };
                          return newAttributes;
                        });
                        
                        // Recargar tipos de relaciones cuando cambie la categoría
                        if (field === 'categoria') {
                          loadTiposRelaciones(value);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>


          {/* Sección de imágenes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-200">Imágenes</h4>
              {imagenes.length > 0 && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {imagenes.length}
                </span>
              )}
            </div>
            
            {/* Input para subir imágenes */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Seleccionar Imágenes</span>
              </label>
            </div>

            {/* Vista previa de imágenes */}
            {imagenes.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {imagenes.map((img, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3 space-y-2">
                    <div className="relative aspect-video bg-gray-800 rounded overflow-hidden">
                      <img 
                        src={img.preview} 
                        alt={`Preview ${index}`}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Nombre (ej: retrato, cuadro)"
                      value={img.nombre_imagen}
                      onChange={(e) => updateImageName(index, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Fuente (opcional)"
                      value={img.fuente || ''}
                      onChange={(e) => updateImageFuente(index, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-4 pt-4 border-t-2 border-gray-700">
            <button 
              type="submit"
              disabled={adding}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform shadow-lg ${
                adding 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105'
              }`}
            >
              {adding ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Agregar Persona</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddPersonaForm;