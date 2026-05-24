import axios from 'axios';

// Create an instance of axios with the base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : "http://localhost:8000")
});

// Export the Axios instance
export default api;

// ============== ATRIBUTOS TEMPORALES ==============

/**
 * Obtener todos los atributos temporales de una persona
 */
export const fetchAtributos = async (personaId) => {
  const response = await api.get(`/personas/${personaId}/atributos/`);
  return response.data;
};

/**
 * Crear un nuevo atributo temporal
 */
export const createAtributo = async (personaId, atributoData) => {
  const response = await api.post(`/personas/${personaId}/atributos/`, atributoData);
  return response.data;
};

/**
 * Actualizar un atributo temporal existente
 */
export const updateAtributo = async (personaId, atributoId, atributoData) => {
  const response = await api.put(`/personas/${personaId}/atributos/${atributoId}`, atributoData);
  return response.data;
};

/**
 * Eliminar un atributo temporal
 */
export const deleteAtributo = async (personaId, atributoId) => {
  const response = await api.delete(`/personas/${personaId}/atributos/${atributoId}`);
  return response.data;
};

/**
 * Obtener historial de un atributo específico
 */
export const fetchAtributoHistorial = async (personaId, nombreAtributo) => {
  const response = await api.get(`/personas/${personaId}/atributos/${nombreAtributo}/historial`);
  return response.data;
};