export const relationshipGenderMap = {
  'esposa': { M: 'Esposo', F: 'Esposa' },
  'esposo': { M: 'Esposo', F: 'Esposa' },
  'madre': { M: 'Padre', F: 'Madre' },
  'padre': { M: 'Padre', F: 'Madre' },
  'hija': { M: 'Hijo', F: 'Hija' },
  'hijo': { M: 'Hijo', F: 'Hija' },
  'abuela': { M: 'Abuelo', F: 'Abuela' },
  'abuelo': { M: 'Abuelo', F: 'Abuela' },
  'hermana': { M: 'Hermano', F: 'Hermana' },
  'hermano': { M: 'Hermano', F: 'Hermana' },
  'tía': { M: 'Tío', F: 'Tía' },
  'tío': { M: 'Tío', F: 'Tía' },
  'sobrina': { M: 'Sobrino', F: 'Sobrina' },
  'sobrino': { M: 'Sobrino', F: 'Sobrina' },
  'prima': { M: 'Primo', F: 'Prima' },
  'primo': { M: 'Primo', F: 'Prima' },
  'suegra': { M: 'Suegro', F: 'Suegra' },
  'suegro': { M: 'Suegro', F: 'Suegra' },
  'cuñada': { M: 'Cuñado', F: 'Cuñada' },
  'cuñado': { M: 'Cuñado', F: 'Cuñada' },
  'nieta': { M: 'Nieto', F: 'Nieta' },
  'nieto': { M: 'Nieto', F: 'Nieta' },
  'madrastra': { M: 'Padrastro', F: 'Madrastra' },
  'padrastro': { M: 'Padrastro', F: 'Madrastra' },
  'hermanastra': { M: 'Hermanastro', F: 'Hermanastra' },
  'hermanastro': { M: 'Hermanastro', F: 'Hermanastra' },
  'nuera': { M: 'Yerno', F: 'Nuera' },
  'yerno': { M: 'Yerno', F: 'Nuera' },
};

/**
 * Automatically corrects the relationship name based on the specified gender.
 * 
 * @param {string} relationship - The input relationship name (e.g. "Esposa")
 * @param {string} gender - The gender of the person ('M' or 'F')
 * @returns {string} The corrected relationship name, or the original if no match
 */
export const autoCorrectRelationship = (relationship, gender) => {
  if (!gender || !relationship) return relationship;
  const relLower = relationship.toLowerCase().trim();
  
  // Use mapping if available
  if (relationshipGenderMap[relLower]) {
    return relationshipGenderMap[relLower][gender] || relationship;
  }
  
  return relationship;
};
