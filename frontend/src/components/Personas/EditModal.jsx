import React from 'react';
import AtributosTemporales from '../AtributosTemporales';
import KinshipSelector from './KinshipSelector';
import SearchableSelect from '../common/SearchableSelect';
import { autoCorrectRelationship } from '../../utils/kinshipUtils';

const EditModal = ({
  persona,
  editFormData,
  editRelaciones,
  imagenes,
  newImagenes,
  showAddFieldForm,
  allPersonas,
  tiposRelaciones,
  onClose,
  onSave,
  onFormChange,
  onRemoveRelacion,
  onImageUpload,
  onUpdateImageName,
  onUpdateImageFuente,
  onRemoveNewImage,
  onDeleteExistingImage,
  onAddRelacion,
  onNewFieldChange,
  onConfirmAddField,
  onCancelAddField
}) => {
  // Estado local para los campos de la nueva relación
  const [localNewFieldData, setLocalNewFieldData] = React.useState({
    name: '',
    categoria: 'familiar',
    personaRelacionadaId: '',
    nombreNuevo: '',
    apellidoNuevo: '',
    generoNuevo: '',
    fechaNacNuevo: '',
    lugarNacNuevo: '',
    fechaDefNuevo: '',
    lugarDefNuevo: ''
  });

  const addFieldFormRef = React.useRef(null);

  React.useEffect(() => {
    if (showAddFieldForm) {
      setTimeout(() => {
        addFieldFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [showAddFieldForm]);

  React.useEffect(() => {
    if (editFormData?.Genero && localNewFieldData.name) {
      const correctedName = autoCorrectRelationship(localNewFieldData.name, editFormData.Genero);
      if (correctedName !== localNewFieldData.name) {
        setLocalNewFieldData(prev => ({ ...prev, name: correctedName }));
        if (onNewFieldChange) {
          onNewFieldChange('name', correctedName);
        }
      }
    }
  }, [editFormData?.Genero]);

  if (!persona) return null;

  const handleLocalChange = (field, value) => {
    let finalValue = value;
    if (field === 'name' && editFormData?.Genero) {
      finalValue = autoCorrectRelationship(value, editFormData.Genero);
    }
    setLocalNewFieldData(prev => ({ ...prev, [field]: finalValue }));
    if (onNewFieldChange) {
      onNewFieldChange(field, finalValue);
    }
  };

  const clearLocalFields = () => {
    setLocalNewFieldData({
      name: '',
      categoria: 'familiar',
      personaRelacionadaId: '',
      nombreNuevo: '',
      apellidoNuevo: '',
      generoNuevo: '',
      fechaNacNuevo: '',
      lugarNacNuevo: '',
      fechaDefNuevo: '',
      lugarDefNuevo: ''
    });
  };

  const handleConfirm = () => {
    if (onConfirmAddField) onConfirmAddField(localNewFieldData);
    clearLocalFields();
  };

  const handleCancel = () => {
    // Comprobar si hay cambios sin guardar en los campos básicos
    const isDirty = 
      editFormData.Nombre !== persona.Nombre ||
      editFormData.Apellidos !== persona.Apellidos ||
      editFormData.Genero !== (persona.Genero || null);

    if (isDirty) {
      const confirmSave = window.confirm(
        "Has modificado datos (Nombre, Apellidos o Género). \n\n" +
        "Para guardar estos cambios debes pulsar el botón de abajo 'Guardar Cambios'.\n\n" +
        "¿Estás seguro de que quieres cerrar SIN GUARDAR estos cambios?"
      );
      if (!confirmSave) return;
    }

    if (onClose) onClose();
    clearLocalFields();
  };

  const handleCancelSubform = () => {
    if (onCancelAddField) onCancelAddField();
    clearLocalFields();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[1000] p-4">
      <div className="bg-gray-800 border-2 border-gray-700 p-8 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={handleCancel}
            className="absolute -top-4 -right-4 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white p-2 rounded-full transition-all duration-200 shadow-lg border border-gray-600"
            title="Cerrar sin guardar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h3 className="mb-6 text-2xl font-bold text-white text-center flex items-center justify-center gap-3">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Persona
          </h3>
        </div>

        {/* Campos básicos */}
        <div className="mb-6">
          <div className="mb-4">
            <label className="block text-gray-200 mb-2 font-semibold">
              Nombre:
            </label>
            <input
              type="text"
              value={editFormData.Nombre}
              onChange={(e) => onFormChange('Nombre', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-200 mb-2 font-semibold">
              Apellidos:
            </label>
            <input
              type="text"
              value={editFormData.Apellidos}
              onChange={(e) => onFormChange('Apellidos', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-200 mb-2 font-semibold">
              Género <span className="text-red-400">*</span>:
            </label>
            <SearchableSelect
              options={[
                { label: 'Masculino', value: 'M' },
                { label: 'Femenino', value: 'F' }
              ]}
              value={editFormData.Genero}
              onChange={(val) => onFormChange('Genero', val)}
              placeholder="Selecciona género"
            />
          </div>
        </div>

        {/* Atributos Temporales */}
        <div className="mb-6">
          <h4 className="text-white font-bold text-lg mb-4">Atributos Temporales</h4>
          <AtributosTemporales personaId={persona.id} />
        </div>

        {/* Relaciones */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-bold text-lg">Relaciones</h4>
            {onAddRelacion && (
              <button
                onClick={onAddRelacion}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir Relación
              </button>
            )}
          </div>
          
          {/* Formulario para añadir nueva relación (MOVIDO ARRIBA) */}
          {showAddFieldForm && (
            <div 
              ref={addFieldFormRef}
              className="mt-4 p-4 bg-gray-700 rounded-lg border-2 border-blue-500 mb-6"
            >
              <h5 className="text-white font-semibold mb-3">Nueva Relación</h5>
              
              <div className="space-y-3">
                <div className="relative">
                  <label className="block text-sm text-gray-300 mb-2">Parentesco / Relación</label>
                  <KinshipSelector 
                    value={localNewFieldData.name}
                    onChange={(val) => {
                      handleLocalChange('name', val);
                      // Determinar si es familiar o no
                      const isFamiliar = Object.values(kinshipCategories).some(rels => 
                        rels.some(r => r.name === val)
                      );
                      handleLocalChange('categoria', isFamiliar ? 'familiar' : 'otro');
                    }}
                    tiposRelaciones={tiposRelaciones}
                    categoria={localNewFieldData.categoria}
                  />
                </div>

                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Categoría</label>
                  <SearchableSelect
                    options={[
                      { label: 'Familiar', value: 'familiar' },
                      { label: 'Otro', value: 'otro' }
                    ]}
                    value={localNewFieldData.categoria}
                    onChange={(val) => handleLocalChange('categoria', val)}
                    placeholder="Seleccionar..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Persona Relacionada</label>
                  <SearchableSelect
                    options={allPersonas ? allPersonas.map(p => ({ label: `${p.Nombre} ${p.Apellidos}`, value: p.id.toString() })) : []}
                    value={localNewFieldData.personaRelacionadaId?.toString() || ''}
                    onChange={(val) => handleLocalChange('personaRelacionadaId', val ? parseInt(val) : '')}
                    disabled={localNewFieldData.nombreNuevo || localNewFieldData.apellidoNuevo}
                    placeholder="Seleccionar persona existente..."
                  />
                </div>
                
                <div className="text-sm text-gray-400 text-center py-2">— o crear nueva persona —</div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={localNewFieldData.nombreNuevo}
                      onChange={(e) => handleLocalChange('nombreNuevo', e.target.value)}
                      disabled={localNewFieldData.personaRelacionadaId}
                      placeholder="Nombre"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Apellidos</label>
                    <input
                      type="text"
                      value={localNewFieldData.apellidoNuevo}
                      onChange={(e) => handleLocalChange('apellidoNuevo', e.target.value)}
                      disabled={localNewFieldData.personaRelacionadaId}
                      placeholder="Apellidos"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">Género <span className="text-red-400">*</span></label>
                    <SearchableSelect
                      options={[
                        { label: 'Masculino', value: 'M' },
                        { label: 'Femenino', value: 'F' }
                      ]}
                      value={localNewFieldData.generoNuevo}
                      onChange={(val) => handleLocalChange('generoNuevo', val)}
                      disabled={localNewFieldData.personaRelacionadaId}
                      placeholder="Selecciona género"
                    />
                </div>

                {/* Biografía para nueva persona */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-600">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider">Nacimiento</label>
                    <input
                      type="text"
                      placeholder="DD-MM-YYYY (ej: 00-00-1900)"
                      value={localNewFieldData.fechaNacNuevo}
                      onChange={(e) => handleLocalChange('fechaNacNuevo', e.target.value)}
                      disabled={localNewFieldData.personaRelacionadaId}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm placeholder-gray-500 disabled:opacity-50"
                    />
                    <input
                      type="text"
                      placeholder="Lugar de nacimiento"
                      value={localNewFieldData.lugarNacNuevo}
                      onChange={(e) => handleLocalChange('lugarNacNuevo', e.target.value)}
                      disabled={localNewFieldData.personaRelacionadaId}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm placeholder-gray-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-red-400 uppercase tracking-wider">Defunción</label>
                    <input
                      type="text"
                      placeholder="DD-MM-YYYY (ej: 00-00-1950)"
                      value={localNewFieldData.fechaDefNuevo}
                      onChange={(e) => handleLocalChange('fechaDefNuevo', e.target.value)}
                      disabled={localNewFieldData.personaRelacionadaId}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm placeholder-gray-500 disabled:opacity-50"
                    />
                    <input
                      type="text"
                      placeholder="Lugar de defunción"
                      value={localNewFieldData.lugarDefNuevo}
                      onChange={(e) => handleLocalChange('lugarDefNuevo', e.target.value)}
                      disabled={localNewFieldData.personaRelacionadaId}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm placeholder-gray-500 disabled:opacity-50"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 italic">Nota:  Usa 00 para partes desconocidas: 00-00-1900 (solo año)</p>
                
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Añadir
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSubform}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {editRelaciones.length > 0 ? (
            editRelaciones.map((relacion, index) => (
              <div
                key={`relacion-${index}`}
                className={`flex gap-3 mb-3 items-center p-3 rounded-lg border-2 ${
                  relacion.isExisting
                    ? 'bg-green-900/30 border-green-600'
                    : 'bg-blue-900/30 border-blue-600'
                }`}
              >
                <div className="flex-[0_0_150px]">
                  <strong className="text-white">
                    {relacion.isExisting ? '🔗' : '✨'} {relacion.tipo_relacion}:
                  </strong>
                  {relacion.isExisting && (
                    <div className="text-xs text-gray-400">(Existente)</div>
                  )}
                </div>
                <div className="flex-1 text-gray-200">{relacion.display_name}</div>
                <button
                  onClick={() => onRemoveRelacion(index)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200"
                  title={
                    relacion.isExisting
                      ? `Eliminar relación existente: ${relacion.tipo_relacion}`
                      : `Quitar relación nueva: ${relacion.tipo_relacion}`
                  }
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic text-center py-6">
              Esta persona no tiene relaciones.
            </p>
          )}
        </div>




        {/* Sección de imágenes */}
        <div className="mb-6 border-t-2 border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white font-bold text-lg">Imágenes</h4>
              <small className="text-gray-400 text-xs">
                Gestiona las imágenes asociadas a esta persona
              </small>
            </div>
            <div className="flex items-center gap-2">
              {(imagenes.length + newImagenes.length) > 0 && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {imagenes.length + newImagenes.length}
                </span>
              )}
            </div>
          </div>

          {/* Imágenes existentes */}
          {imagenes.length > 0 && (
            <div className="mb-4">
              <h5 className="text-gray-300 text-sm font-semibold mb-2">Imágenes Actuales</h5>
              <div className="grid grid-cols-2 gap-3">
                {imagenes.map((img) => (
                  <div key={img.id} className="bg-gray-700 rounded-lg p-3 space-y-2">
                    <div className="relative aspect-video bg-gray-800 rounded overflow-hidden">
                      <img 
                        src={img.url.startsWith('http') ? img.url : `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000')}${img.url}`}
                        alt={img.nombre_imagen}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => onDeleteExistingImage(img.id)}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-sm text-gray-300 font-medium">
                      {img.nombre_imagen}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuevas imágenes a subir */}
          {newImagenes.length > 0 && (
            <div className="mb-4">
              <h5 className="text-gray-300 text-sm font-semibold mb-2">Nuevas Imágenes</h5>
              <div className="grid grid-cols-2 gap-3">
                {newImagenes.map((img, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3 space-y-2 border-2 border-blue-500/50">
                    <div className="relative aspect-video bg-gray-800 rounded overflow-hidden">
                      <img 
                        src={img.preview} 
                        alt={`Nueva imagen ${index}`}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveNewImage(index)}
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
                      onChange={(e) => onUpdateImageName(index, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Fuente (opcional)"
                      value={img.fuente || ''}
                      onChange={(e) => onUpdateImageFuente(index, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input para subir nuevas imágenes */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onImageUpload}
              className="hidden"
              id="edit-image-upload"
            />
            <label
              htmlFor="edit-image-upload"
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg cursor-pointer transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Añadir Imágenes</span>
            </label>
          </div>
        </div>

        {/* Botones principales */}
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={handleCancel}
            className="px-6 py-3 border-2 border-gray-600 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
