/**
 * Valida una fecha parcial en formato DD-MM-YYYY
 * Soporta 00 para d\u00eda o mes desconocido
 * @param {string} dateStr 
 * @returns {{isValid: boolean, error?: string}}
 */
export const validatePartialDate = (dateStr) => {
  if (!dateStr) return { isValid: true };
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return { isValid: false, error: 'Formato inv\u00e1lido. Use DD-MM-YYYY' };
  }
  
  const [d, m, y] = parts.map(p => parseInt(p, 10));
  
  if (isNaN(d) || isNaN(m) || isNaN(y)) {
    return { isValid: false, error: 'La fecha debe contener solo n\u00fameros' };
  }
  
  if (m < 0 || m > 12) {
    return { isValid: false, error: 'Mes inv\u00e1lido (1-12 o 00)' };
  }
  
  if (d < 0 || d > 31) {
    return { isValid: false, error: 'D\u00eda inv\u00e1lido (1-31 o 00)' };
  }
  
  // Validaci\u00f3n m\u00e1s estricta para meses conocidos
  if (m > 0 && d > 0) {
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d > daysInMonth) {
      return { isValid: false, error: `El d\u00eda ${d} no es v\u00e1lido para el mes ${m} del a\u00f1o ${y}` };
    }
  }
  
  return { isValid: true };
};
