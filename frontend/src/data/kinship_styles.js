export const KINSHIP_COLORS = {
  "0 Grado": "#919191",
  "Grado 0": "#919191",
  "1º Grado": "#5271FF",
  "2º Grado": "#8C52FF",
  "3º Grado": "#B174E7",
  "4º Grado": "#CB6CE6",
  "5º Grado": "#FF66C4",
  "6º Grado": "#FF5050",
  "7º Grado": "#FF914D",
  "8º Grado": "#FFBD59",
  "9º Grado": "#FFDE59",
  "10º Grado": "#C1FF72",
  "11º Grado": "#99E17A",
  "12º Grado": "#5CFFB0",
  "13º Grado": "#5CE1E6",
  "14º Grado": "#99F0FF",
  "15º Grado": "#70CBFF",
  "16º Grado": "#5CA3FF",
  "17º Grado": "#99ACFF",
  "18º Grado": "#C2CDFF",
  "19º Grado": "#BEA1F7",
  "20º Grado": "#E2CBF6",
  "21º Grado": "#FFE7C2",
  "22º Grado": "#FFF3C2"
};

// Map each relationship name to its degree and category (Consanguinidad/Afinidad)
// This will be used by the graph to style edges.
import kinshipCategories from './kinship_categories.json';

const nameToStyle = {};
Object.entries(kinshipCategories).forEach(([category, relations]) => {
  const isAffinity = category.toLowerCase().includes('afinidad');
  relations.forEach(rel => {
    nameToStyle[rel.name.toLowerCase()] = {
      degree: rel.degree,
      category: category,
      filterKey: `${rel.degree} de parentesco por ${category.toLowerCase()}`,
      color: KINSHIP_COLORS[rel.degree] || "#919191",
      dashed: isAffinity
    };
  });
});

export const KINSHIP_MAPPING = nameToStyle;

export const getEdgeStyle = (relationName) => {
  if (!relationName) return { degree: "Desconocido", color: "#919191", dashed: false };
  const normalized = relationName.toLowerCase().trim();
  return KINSHIP_MAPPING[normalized] || {
    degree: "Desconocido",
    color: "#919191",
    dashed: false
  };
};
