import React, { useEffect, useState } from 'react';
import api from "../api.js";
import AddPersonaForm from './AddPersonaForm.jsx';
import SearchFilters from './Personas/SearchFilters.jsx';
import PersonaRow from './Personas/PersonaRow.jsx';
import DeleteModal from './Personas/DeleteModal.jsx';
import EditModal from './Personas/EditModal.jsx';
import PersonaInfo from './Personas/PersonaInfo.jsx';
import { ChevronDown, Users, ArrowUp, ArrowDown, Download, FileJson, FileSpreadsheet } from 'lucide-react';

const Personas = ({ onViewPersona }) => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [advancedFilters, setAdvancedFilters] = useState([]);
  const [showMen, setShowMen] = useState(false);
  const [sortByDate, setSortByDate] = useState('none');

  const [personaToDelete, setPersonaToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [personaToEdit, setPersonaToEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    Nombre: '',
    Apellidos: '',
    Genero: null
  });
  const [editRelaciones, setEditRelaciones] = useState([]);
  const [originalRelaciones, setOriginalRelaciones] = useState([]);
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);

  const [allPersonas, setAllPersonas] = useState([]);
  const [tiposRelaciones, setTiposRelaciones] = useState([]);

  const [editImagenes, setEditImagenes] = useState([]);
  const [newImagenes, setNewImagenes] = useState([]);
  const [imagenesToDelete, setImagenesToDelete] = useState([]);



  const getSortedPersonas = (personasToSort) => {
    if (sortByDate === 'none') return personasToSort;

    return [...personasToSort].sort((a, b) => {
      const dateA = a.FechaNacimiento;
      const dateB = b.FechaNacimiento;

      // Función auxiliar para convertir DD-MM-YYYY a un valor comparable
      const getComparable = (dStr) => {
        if (!dStr) return Infinity; // Personas sin fecha al final
        const parts = dStr.split('-');
        if (parts.length !== 3) return Infinity;
        
        const [d, m, y] = parts.map(p => parseInt(p, 10));
        // Manejar 00 como 01 para d\u00eda/mes si el a\u00f1o existe
        const year = isNaN(y) ? 9999 : y;
        const month = isNaN(m) || m === 0 ? 1 : m;
        const day = isNaN(d) || d === 0 ? 1 : d;
        
        return year * 10000 + month * 100 + day;
      };

      const valA = getComparable(dateA);
      const valB = getComparable(dateB);

      if (sortByDate === 'asc') return valA - valB;
      return valB - valA;
    });
  };

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/personas/');
      setPersonas(response.data);
    } catch (error) {
      console.error("Error fetching personas", error);
      setError("Error al cargar las personas. Asegúrate de que el servidor esté ejecutándose.");
    } finally {
      setLoading(false);
    }
  };

  // Nueva función de búsqueda avanzada con filtros de atributos temporales
  const searchPersonas = async () => {
    try {
      setSearching(true);
      setError(null);
      
      // Construir objeto de filtros
      const filters = {
        search_text: searchTerm.trim() || null,
        filtros_avanzados: advancedFilters.map(f => ({
          nombre_atributo: f.nombre_atributo,
          valor: f.valor,
          fecha_desde: f.fecha_desde,
          fecha_hasta: f.fecha_hasta
        })),
        genero: null
      };
      
      const response = await api.post('/personas/search/', filters);
      setPersonas(response.data);
    } catch (error) {
      console.error("Error searching personas", error);
      setError("Error al buscar personas. Verifica los filtros e intenta nuevamente.");
    } finally {
      setSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAdvancedFilters([]);
    setFilterResetKey(prev => prev + 1);
  };

  const fetchAvailableAtributos = async () => {
    try {
      const response = await api.get('/personas/atributos/nombres/');
      setAvailableColumns(response.data.atributos || []);
    } catch (error) {
      console.error("Error fetching atributos", error);
      setAvailableColumns([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPersonas();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, advancedFilters]);

  const fetchTiposRelaciones = async (categoria = null) => {
    try {
      const url = categoria ? `/relaciones/tipos/?categoria=${categoria}` : '/relaciones/tipos/';
      const response = await api.get(url);
      setTiposRelaciones(response.data.tipos_relaciones || []);
    } catch (error) {
      console.error("Error fetching tipos de relaciones", error);
    }
  };

  const addPersona = async (personaData) => {
    try {
      setAdding(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await api.post('/personas/', personaData);
      
      // Mostrar mensaje de éxito
      setSuccessMessage(`Persona "${response.data.Nombre} ${response.data.Apellidos}" añadida correctamente con ID: ${response.data.id}`);
      
      // Actualizar la lista
      await fetchPersonas();
      await fetchAvailableAtributos();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // IMPORTANTE: Devolver los datos de la persona creada
      return response.data;
      
    } catch (error) {
      console.error("Error adding persona", error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(`Error: ${error.response.data.detail}`);
      } else {
        setError("Error al agregar la persona. Verifica los datos e intenta nuevamente.");
      }
      throw error; // Re-lanzar el error para que AddPersonaForm lo pueda manejar
    } finally {
      setAdding(false);
    }
  };

  // Funciones de exportación
  const handleExportJSON = async () => {
    try {
      const response = await api.get('/export/json');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `picuvimu_dump_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting JSON", error);
      setError("Error al exportar datos en JSON.");
    }
  };

  const handleExportCSV = async (type) => {
    try {
      // Usamos window.open para la descarga directa o api.get con blob
      const response = await api.get(`/export/csv/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${type} CSV`, error);
      setError(`Error al exportar ${type} en CSV.`);
    }
  };

  // Función para manejar eliminación de persona
  const handleDeleteClick = (persona) => {
    setPersonaToDelete(persona);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!personaToDelete) return;
    
    try {
      setLoading(true);
      await api.delete(`/personas/${personaToDelete.id}`);
      
      setSuccessMessage(`Persona "${personaToDelete.Nombre} ${personaToDelete.Apellidos}" eliminada correctamente`);
      
      // Actualizar la lista
      await fetchPersonas();
      await fetchAvailableAtributos();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error("Error deleting persona", error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(`Error: ${error.response.data.detail}`);
      } else {
        setError("Error al eliminar la persona.");
      }
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setPersonaToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPersonaToDelete(null);
  };

  // Funciones para ver información de persona
  const handleViewClick = (persona) => {
    onViewPersona(persona);
  };



  // Funciones para editar persona
  const handleEditClick = async (persona) => {
    setPersonaToEdit(persona);
    
    setEditFormData({
      Nombre: persona.Nombre,
      Apellidos: persona.Apellidos,
      Genero: persona.Genero || null
    });
    
    // Cargar todas las personas para el desplegable de relaciones
    await loadAllPersonasForEdit();
    
    // Cargar relaciones existentes
    await loadPersonaRelaciones(persona.id);
    
    // Cargar imágenes existentes
    await loadPersonaImagenes(persona.id);
    
    setShowEditModal(true);
  };

  // Función para cargar las relaciones de una persona
  const loadPersonaRelaciones = async (personaId) => {
    try {
      const response = await api.get(`/personas/${personaId}/relaciones/`);
      
      // Convertir las relaciones del backend al formato del frontend
      const relacionesMapeadas = response.data.map(rel => ({
        id: rel.id, // ID de la relación en la BD
        tipo_relacion: rel.tipo_relacion,
        persona_relacionada_id: rel.persona_relacionada.id,
        display_name: `${rel.persona_relacionada.Nombre} ${rel.persona_relacionada.Apellidos}`,
        isExisting: true // Marcar como existente para distinguir de nuevas
      }));
      
      setEditRelaciones(relacionesMapeadas);
      setOriginalRelaciones([...relacionesMapeadas]); // Copia para rastrear eliminaciones
    } catch (error) {
      console.error('Error cargando relaciones:', error);
      setEditRelaciones([]);
      setOriginalRelaciones([]);
    }
  };

  // Función para cargar las imágenes de una persona
  const loadPersonaImagenes = async (personaId) => {
    try {
      const response = await api.get(`/personas/${personaId}/imagenes/`);
      setEditImagenes(response.data);
      setNewImagenes([]);
      setImagenesToDelete([]);
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      setEditImagenes([]);
      setNewImagenes([]);
      setImagenesToDelete([]);
    }
  };

  // Manejadores de imágenes
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setNewImagenes(prev => [...prev, { 
          nombre_imagen: '', 
          imagen_data: base64String,
          preview: base64String 
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateImageName = (index, name) => {
    const updatedImagenes = [...newImagenes];
    updatedImagenes[index].nombre_imagen = name;
    setNewImagenes(updatedImagenes);
  };

  const handleUpdateImageFuente = (index, fuente) => {
    const updatedImagenes = [...newImagenes];
    updatedImagenes[index].fuente = fuente;
    setNewImagenes(updatedImagenes);
  };

  const handleRemoveNewImage = (index) => {
    setNewImagenes(newImagenes.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (imagenId) => {
    setImagenesToDelete(prev => [...prev, imagenId]);
    setEditImagenes(editImagenes.filter(img => img.id !== imagenId));
  };

  const handleEditFormChange = (field, value) => {
    if (field === 'Nombre' || field === 'Apellidos' || field === 'Genero') {
      setEditFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      // Campo dinámico
      setEditFormData(prev => ({
        ...prev,
        extra_fields: {
          ...prev.extra_fields,
          [field]: value
        }
      }));
    }
  };

  const saveEdit = async () => {
    if (!personaToEdit) return;
    
    // Validar género de la persona principal
    if (!editFormData.Genero) {
      alert('Por favor, selecciona un género (Masculino o Femenino) para la persona.');
      return;
    }

    // Validar género de nuevas personas en las relaciones
    const relacionesNuevasSinGenero = editRelaciones.filter(rel => !rel.isExisting && rel.nueva_persona && !rel.nueva_persona.Genero);
    if (relacionesNuevasSinGenero.length > 0) {
      alert(`Por favor, selecciona un género para las nuevas personas creadas en las relaciones (${relacionesNuevasSinGenero[0].display_name}).`);
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para enviar
      const dataToSend = {
        Nombre: editFormData.Nombre,
        Apellidos: editFormData.Apellidos,
        Genero: editFormData.Genero
      };
      
      // Actualizar la persona
      await api.put(`/personas/${personaToEdit.id}`, dataToSend);
      
      // Procesar solo relaciones nuevas (las existentes ya están en la BD)
      const relacionesNuevas = editRelaciones.filter(rel => !rel.isExisting);
      
      for (const relacion of relacionesNuevas) {
        try {
          let relacionData = {
            tipo_relacion: relacion.tipo_relacion,
            categoria: relacion.categoria || 'familiar'
          };
          
          // Si es una persona existente
          if (relacion.persona_relacionada_id) {
            relacionData.persona_relacionada_id = relacion.persona_relacionada_id;
          }
          // Si hay que crear una nueva persona
          else if (relacion.nueva_persona) {
            relacionData.nombre_nuevo = relacion.nueva_persona.Nombre;
            relacionData.apellido_nuevo = relacion.nueva_persona.Apellidos;
            relacionData.genero_nuevo = relacion.nueva_persona.Genero;
            relacionData.fecha_nac_nuevo = relacion.nueva_persona.FechaNacimiento;
            relacionData.lugar_nac_nuevo = relacion.nueva_persona.LugarNacimiento;
            relacionData.fecha_def_nuevo = relacion.nueva_persona.FechaDefuncion;
            relacionData.lugar_def_nuevo = relacion.nueva_persona.LugarDefuncion;
          }
          
          try {
            await api.post(`/personas/${personaToEdit.id}/relaciones/`, relacionData);
          } catch (err) {
            const errorMsg = err.response?.data?.detail || "Error al crear la relación";
            alert(errorMsg);
            // No continuamos con el resto de la operación si falla
            return;
          }
        } catch (error) {
          console.error('Error creando relación nueva:', error);
          throw new Error(`Error creando relación: ${error.message}`);
        }
      }
      
      // Detectar y eliminar relaciones que se han quitado
      const relacionesActualesIds = editRelaciones.filter(rel => rel.isExisting).map(rel => rel.id);
      const relacionesEliminadas = originalRelaciones.filter(rel => !relacionesActualesIds.includes(rel.id));
      
      for (const relacionEliminada of relacionesEliminadas) {
        try {
          await api.delete(`/relaciones/${relacionEliminada.id}`);
        } catch (error) {
          console.error('Error eliminando relación:', error);
          throw new Error(`Error eliminando relación: ${error.message}`);
        }
      }
      
      // Eliminar imágenes marcadas para eliminar
      for (const imagenId of imagenesToDelete) {
        try {
          await api.delete(`/imagenes/${imagenId}`);
        } catch (error) {
          console.error('Error eliminando imagen:', error);
        }
      }
      
      // Subir nuevas imágenes
      const imageErrors = [];
      for (const imagen of newImagenes) {
        try {
          await api.post(`/personas/${personaToEdit.id}/imagenes/`, {
            nombre_imagen: imagen.nombre_imagen.trim() || 'Imagen',
            imagen_data: imagen.imagen_data,
            fuente: imagen.fuente || ''
          });
        } catch (error) {
          console.error('Error subiendo imagen:', error);
          const msg = error.response?.data?.detail || error.message;
          imageErrors.push(`Imagen "${imagen.nombre_imagen || 'sin nombre'}": ${msg}`);
        }
      }
      
      if (imageErrors.length > 0) {
        setError(`Persona actualizada, pero algunas imágenes fallaron:\n${imageErrors.join('\n')}`);
      } else {
        setSuccessMessage(`Persona "${editFormData.Nombre} ${editFormData.Apellidos}" actualizada correctamente`);
      }
      
      // Actualizar la lista
      await fetchPersonas();
      await fetchAvailableAtributos();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error("Error updating persona", error);
      if (error.response && error.response.data && error.response.data.detail) {
        setError(`Error: ${error.response.data.detail}`);
      } else {
        setError("Error al actualizar la persona.");
      }
    } finally {
      setLoading(false);
      setShowEditModal(false);
      setPersonaToEdit(null);
      setEditImagenes([]);
      setNewImagenes([]);
      setImagenesToDelete([]);
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setPersonaToEdit(null);
    setEditFormData({
      Nombre: '',
      Apellidos: '',
      Genero: null
    });
    setEditRelaciones([]); // Limpiar relaciones
    setOriginalRelaciones([]); // Limpiar relaciones originales
    setShowAddFieldForm(false);
  };

  // Manejadores del formulario de nueva relación
  const handleAddRelacion = () => {
    setShowAddFieldForm(true);
  };

  const handleRemoveRelacion = (index) => {
    setEditRelaciones(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmAddField = (fieldData) => {
    if (!fieldData || !fieldData.name) return;

    let nuevaRelacion = {
      tipo_relacion: fieldData.name,
      categoria: fieldData.categoria || 'familiar',
      isExisting: false
    };

    if (fieldData.personaRelacionadaId) {
      const personaSeleccionada = allPersonas.find(p => String(p.id) === String(fieldData.personaRelacionadaId));
      nuevaRelacion.persona_relacionada_id = fieldData.personaRelacionadaId;
      nuevaRelacion.display_name = personaSeleccionada
        ? `${personaSeleccionada.Nombre} ${personaSeleccionada.Apellidos}`
        : 'Desconocido';
    } else if (fieldData.nombreNuevo || fieldData.apellidoNuevo) {
      if (!fieldData.generoNuevo) {
        alert('Por favor, selecciona un género para la nueva persona.');
        return;
      }
      nuevaRelacion.nueva_persona = { 
        Nombre: fieldData.nombreNuevo, 
        Apellidos: fieldData.apellidoNuevo,
        Genero: fieldData.generoNuevo || null,
        FechaNacimiento: fieldData.fechaNacNuevo,
        LugarNacimiento: fieldData.lugarNacNuevo,
        FechaDefuncion: fieldData.fechaDefNuevo,
        LugarDefuncion: fieldData.lugarDefNuevo
      };
      nuevaRelacion.display_name = `${fieldData.nombreNuevo} ${fieldData.apellidoNuevo}`.trim();
    } else {
      return; // Nada seleccionado
    }

    setEditRelaciones(prev => [...prev, nuevaRelacion]);
    setShowAddFieldForm(false);
  };

  const handleCancelAddField = () => {
    setShowAddFieldForm(false);
  };

  // Cargar todas las personas para autocompletado de relaciones
  const loadAllPersonasForEdit = async () => {
    try {
      const response = await api.get('/personas/');
      setAllPersonas(response.data);
    } catch (error) {
      console.error('Error cargando personas:', error);
    }
  };

  useEffect(() => {
    fetchPersonas();
    fetchAvailableAtributos();
    fetchTiposRelaciones();
  }, []);

  if (loading) {
    return <div className="text-center p-12 text-gray-300 text-lg"> Cargando personas...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-6">Lista de Personas</h2>
      
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="bg-green-900/50 border border-green-600 text-green-200 p-4 rounded-xl mb-6 backdrop-blur-sm">
          ✅ {successMessage}
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 p-4 rounded-xl mb-6 backdrop-blur-sm">
          Error:  {error}
        </div>
      )}

      {/* Sistema de filtros avanzados */}
      <SearchFilters
        key={filterResetKey}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searching={searching}
        availableColumns={availableColumns}
        clearFilters={clearFilters}
        searchPersonas={searchPersonas}
        onFiltersChange={setAdvancedFilters}
      />

      {/* Exportación de Datos */}
      <div className="flex flex-wrap gap-4 mb-8 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-xl">
        <div className="w-full mb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-400" /> Exportación de Datos Académicos
          </h3>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Descarga el corpus completo para análisis externo en Gephi, Excel o herramientas personalizadas.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExportJSON}
            className="group flex items-center gap-3 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 px-5 py-2.5 rounded-2xl border border-amber-600/20 hover:border-amber-600/40 transition-all duration-300 font-bold text-sm shadow-lg shadow-amber-900/10"
            title="Volcado completo de la base de datos"
          >
            <div className="p-1.5 bg-amber-600/20 rounded-lg group-hover:bg-amber-600/30 transition-colors">
              <FileJson className="w-4 h-4" />
            </div>
            JSON Completo
          </button>
          
          <button 
            onClick={() => handleExportCSV('personas')}
            className="group flex items-center gap-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 px-5 py-2.5 rounded-2xl border border-emerald-600/20 hover:border-emerald-600/40 transition-all duration-300 font-bold text-sm shadow-lg shadow-emerald-900/10"
            title="Exportar lista de personas a CSV"
          >
            <div className="p-1.5 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            Personas (CSV)
          </button>
          
          <button 
            onClick={() => handleExportCSV('relaciones')}
            className="group flex items-center gap-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 px-5 py-2.5 rounded-2xl border border-emerald-600/20 hover:border-emerald-600/40 transition-all duration-300 font-bold text-sm shadow-lg shadow-emerald-900/10"
            title="Exportar matriz de relaciones a CSV"
          >
            <div className="p-1.5 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            Relaciones (CSV)
          </button>
        </div>
      </div>

      {/* Controles de Ordenaci\u00f3n */}
      <div className="flex justify-end mb-4 px-2 mt-4">
        <div className="flex items-center gap-2 bg-slate-800/60 p-1.5 rounded-xl border border-slate-700 backdrop-blur-sm shadow-inner">
          <span className="text-[10px] font-black text-slate-500 px-3 uppercase tracking-widest">Nacimiento:</span>
          <button 
            onClick={() => setSortByDate('none')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
              sortByDate === 'none' 
                ? 'bg-slate-700 text-white shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-slate-600' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Original
          </button>
          <button 
            onClick={() => setSortByDate('asc')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
              sortByDate === 'asc' 
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-500' 
                : 'text-slate-400 hover:text-white hover:bg-blue-600/20'
            }`}
            title="De m\u00e1s antiguo a m\u00e1s reciente"
          >
            <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} /> Antiguo
          </button>
          <button 
            onClick={() => setSortByDate('desc')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
              sortByDate === 'desc' 
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-500' 
                : 'text-slate-400 hover:text-white hover:bg-blue-600/20'
            }`}
            title="De m\u00e1s reciente a m\u00e1s antiguo"
          >
            <ArrowDown className="w-3.5 h-3.5" strokeWidth={3} /> Reciente
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-10 mt-6">
        {/* Sección Mujeres (Siempre Visible) */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-5 px-2">
            <div className="flex items-center gap-3">
              <div className="bg-pink-500/20 p-2 rounded-lg">
                <span className="text-2xl text-pink-400">♀</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Mujeres</h3>
                <p className="text-xs text-pink-400/70 font-semibold uppercase tracking-widest">Registros Principales</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-pink-900/30 px-4 py-2 rounded-xl border border-pink-700/50">
              <span className="text-sm font-bold text-pink-300">
                {personas.filter(p => (p.Genero || '').toLowerCase().startsWith('f') || p.Genero === 'F').length}
              </span>
              <span className="text-[10px] text-pink-400/70 font-bold uppercase">Personas</span>
            </div>
          </div>
          
          <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="flex bg-slate-700/30 p-5 font-bold text-gray-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
              <div className="flex-[0_0_80px] text-center">№</div>
              <div className="flex-1 pl-6">Nombre Completo</div>
              <div className="flex-[0_0_120px] text-center">Acciones</div>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {(() => {
                const women = getSortedPersonas(personas.filter(p => (p.Genero || '').toLowerCase().startsWith('f') || p.Genero === 'F'));
                return women.length > 0 ? (
                  women.map((persona, index, arr) => (
                    <PersonaRow
                      key={persona.id}
                      persona={persona}
                      index={index}
                      totalPersonas={arr.length}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      onView={handleViewClick}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="inline-block p-4 rounded-full bg-slate-700/20 mb-4">
                      <Users className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-500 italic font-medium">No se encontraron registros femeninos</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Barra Desplegable Hombres */}
        <div className="w-full">
          <button 
            onClick={() => setShowMen(!showMen)}
            className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all duration-500 group ${
              showMen 
                ? 'bg-blue-600 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]' 
                : 'bg-slate-800/60 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl transition-colors duration-500 ${showMen ? 'bg-white/20' : 'bg-blue-500/10 group-hover:bg-blue-500/20'}`}>
                <span className={`text-xl ${showMen ? 'text-white' : 'text-blue-400'}`}>♂</span>
              </div>
              <div className="text-left">
                <h3 className={`text-xl font-bold transition-colors duration-500 ${showMen ? 'text-white' : 'text-gray-200'}`}>
                  Hombres
                </h3>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${showMen ? 'text-blue-100' : 'text-blue-400/60'}`}>
                  Registros Complementarios
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-500 ${
                showMen 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-blue-900/20 border-blue-700/30'
              }`}>
                <span className={`text-sm font-black ${showMen ? 'text-white' : 'text-blue-300'}`}>
                  {personas.filter(p => (p.Genero || '').toLowerCase().startsWith('m') || p.Genero === 'M' || p.Genero === 'V').length}
                </span>
                <span className={`text-[9px] font-bold uppercase ${showMen ? 'text-blue-100' : 'text-blue-400/70'}`}>
                  Total
                </span>
              </div>
              <div className={`transition-transform duration-500 ${showMen ? 'rotate-180' : ''}`}>
                <ChevronDown className={showMen ? 'text-white' : 'text-blue-400'} size={24} />
              </div>
            </div>
          </button>
          
          {showMen && (
            <div className="mt-6 animate-slide-down">
              <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden backdrop-blur-md shadow-2xl">
                <div className="flex bg-slate-700/30 p-5 font-bold text-gray-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
                  <div className="flex-[0_0_80px] text-center">№</div>
                  <div className="flex-1 pl-6">Nombre Completo</div>
                  <div className="flex-[0_0_120px] text-center">Acciones</div>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                  {(() => {
                    const men = getSortedPersonas(personas.filter(p => (p.Genero || '').toLowerCase().startsWith('m') || p.Genero === 'M' || p.Genero === 'V'));
                    return men.length > 0 ? (
                      men.map((persona, index, arr) => (
                        <PersonaRow
                          key={persona.id}
                          persona={persona}
                          index={index}
                          totalPersonas={arr.length}
                          onEdit={handleEditClick}
                          onDelete={handleDeleteClick}
                          onView={handleViewClick}
                        />
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <div className="inline-block p-4 rounded-full bg-slate-700/20 mb-4">
                          <Users className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-500 italic font-medium">No se encontraron registros masculinos</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>



      <button 
        onClick={clearFilters}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 mb-6 shadow-sm hover:shadow-md"
      >
        Recargar Lista Completa
      </button>

      <AddPersonaForm 
        addPersona={addPersona} 
        adding={adding} 
      />
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && personaToDelete && (
        <DeleteModal
          persona={personaToDelete}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
      
      {/* Modal de edición de persona */}
      {showEditModal && personaToEdit && (
        <EditModal
          persona={personaToEdit}
          editFormData={editFormData}
          editRelaciones={editRelaciones}
          allPersonas={allPersonas}
          tiposRelaciones={tiposRelaciones}
          imagenes={editImagenes}
          newImagenes={newImagenes}
          showAddFieldForm={showAddFieldForm}
          onClose={cancelEdit}
          onSave={saveEdit}
          onFormChange={handleEditFormChange}
          onImageUpload={handleImageUpload}
          onUpdateImageName={handleUpdateImageName}
          onUpdateImageFuente={handleUpdateImageFuente}
          onRemoveNewImage={handleRemoveNewImage}
          onDeleteExistingImage={handleDeleteExistingImage}
          onAddRelacion={handleAddRelacion}
          onRemoveRelacion={handleRemoveRelacion}
          onConfirmAddField={handleConfirmAddField}
          onCancelAddField={handleCancelAddField}
        />
      )}
    </div>
  );
};

export default Personas;