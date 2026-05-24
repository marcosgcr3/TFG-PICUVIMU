import { MarkerType } from 'reactflow';
import dagre from 'dagre';
import { KINSHIP_COLORS, getEdgeStyle } from '../data/kinship_styles';

// Removed legacy EDGE_STYLES

// Tipos donde persona_id ES EL ANCESTRO y persona_relacionada_id ES EL DESCENDIENTE
const ANCESTOR_RELATION_TYPES = new Map([
  // Generación +1 (hijos directos)
  ['padre', 1], ['madre', 1], ['padre/madre', 1],
  ['padrastro', 1], ['madrastra', 1], ['padrastro/madrastra', 1],
  // Generación +2 (nietos — persona es abuelo/abuela)
  ['abuelo', 2], ['abuela', 2], ['abuelo/abuela', 2], ['abuelo/a', 2],
  // Generación +3 (bisnietos)
  ['bisabuelo', 3], ['bisabuela', 3], ['bisabuelo/bisabuela', 3],
  // Generación +4 (tataranietos)
  ['tatarabuelo', 4], ['tatarabuela', 4],
  ['trastatarabuelo', 5],
  ['trastatarabuela', 5],
  ['pentabuelo', 6],
  ['pentabuela', 6],
  // Colaterales (en relación al ancestro común)
  ['tío', 1], ['tía', 1],
  ['tío abuelo', 2], ['tía abuela', 2],
  ['tío bisabuelo', 3], ['tía bisabuela', 3],
]);

// Tipos donde persona_id ES EL DESCENDIENTE y persona_relacionada_id ES EL ANCESTRO
const DESCENDANT_RELATION_TYPES = new Map([
  ['hijo', 1], ['hija', 1],
  ['nieto', 2], ['nieta', 2],
  ['bisnieto', 3], ['bisnieta', 3],
  ['tataranieto', 4], ['tataranieta', 4],
  // Colaterales descendientes
  ['sobrino', 1], ['sobrina', 1],
  ['sobrino nieto', 2], ['sobrina nieta', 2],
]);

// Relaciones que están en el mismo nivel generacional
const LATERAL_LEVEL_TYPES = new Set([
  'hermano', 'hermana', 'medio hermano', 'media hermana', 'hermanastro', 'hermanastra',
  'primo', 'prima', 'primo segundo', 'prima segunda', 'primo tercero', 'prima tercera',
  'esposo', 'esposa', 'cónyuge', 'pareja', 'concuñado', 'concuñada'
]);

// Para compatibilidad con el código existente
const PARENT_RELATION_TYPES = new Set(ANCESTOR_RELATION_TYPES.keys());
const CHILD_RELATION_TYPES = new Set(DESCENDANT_RELATION_TYPES.keys());

const CHILD_TO_PARENT_LABEL = {
  hijo: 'Padre/Madre',
  hija: 'Padre/Madre',
  'hijo/a': 'Padre/Madre',
  hijastro: 'Padrastro/Madrastra',
  hijastra: 'Padrastro/Madrastra',
  'hijastro/a': 'Padrastro/Madrastra',
  nieto: 'Abuelo/Abuela',
  nieta: 'Abuelo/Abuela',
  'nieto/nieta': 'Abuelo/Abuela',
  'nieto/a': 'Abuelo/Abuela',
  bisnieto: 'Bisabuelo/Bisabuela',
  bisnieta: 'Bisabuelo/Bisabuela',
  tataranieto: 'Tatarabuelo/Tatarabuela',
  tataranieta: 'Tatarabuelo/Tatarabuela',
};

const resolveParentLabelByGender = (genero, genericLabel = 'Padre/Madre') => {
  const g = (genero || '').toLowerCase().trim();
  const isMale = ['masculino', 'hombre', 'varon', 'varón', 'm'].includes(g);
  const isFemale = ['femenino', 'mujer', 'f'].includes(g);

  // Si es una etiqueta compuesta (ej: "Bisabuelo/Bisabuela"), resolvemos por género
  if (genericLabel.includes('/')) {
    const parts = genericLabel.split('/');
    if (isMale) return parts[0].trim();
    if (isFemale) return (parts[1] || parts[0]).trim();
    return genericLabel;
  }

  // Mapeo manual para etiquetas simples que necesitan flexión de género
  const genderMap = {
    'padre': { m: 'Padre', f: 'Madre' },
    'madre': { m: 'Padre', f: 'Madre' },
    'abuelo': { m: 'Abuelo', f: 'Abuela' },
    'abuela': { m: 'Abuelo', f: 'Abuela' },
    'bisabuelo': { m: 'Bisabuelo', f: 'Bisabuela' },
    'bisabuela': { m: 'Bisabuelo', f: 'Bisabuela' },
    'tatarabuelo': { m: 'Tatarabuelo', f: 'Tatarabuela' },
    'tatarabuela': { m: 'Tatarabuelo', f: 'Tatarabuela' },
    'padrastro': { m: 'Padrastro', f: 'Madrastra' },
    'madrastra': { m: 'Padrastro', f: 'Madrastra' },
  };

  const normalizedLabel = genericLabel.toLowerCase().trim();
  if (genderMap[normalizedLabel]) {
    if (isMale) return genderMap[normalizedLabel].m;
    if (isFemale) return genderMap[normalizedLabel].f;
  }

  return genericLabel;
};

// Now use KINSHIP_MAPPING for styling
export const createEdgeStyle = (tipoRelacion, animated = false, isNetwork = false) => {
  const normalized = normalizeRelationType(tipoRelacion);
  const styleInfo = getEdgeStyle(normalized) || getEdgeStyle(tipoRelacion);
  const strokeColor = styleInfo.color || '#5271FF';

  return {
    type: isNetwork ? 'default' : 'smoothstep', // Bezier para red, Step para árbol
    style: {
      stroke: strokeColor,
      strokeWidth: 3,
      strokeDasharray: styleInfo.dashed ? '5,5' : undefined,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: strokeColor,
    },
    labelStyle: {
      fill: strokeColor,
      fontWeight: 600,
      fontSize: 11,
    },
    labelBgStyle: {
      fill: '#1e293b',
      fillOpacity: 0.8,
    },
    labelBgPadding: [4, 2],
    labelBgBorderRadius: 4,
    animated: false,
  };
};


// Layout automático en cuadrícula
export const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 70, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 50,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Layout jerárquico centrado por niveles (el preferido por el usuario)
export const getHierarchicalLayoutedElements = (nodes, edges, levelMap) => {
  if (!nodes.length) {
    return { nodes: [], edges: [] };
  }

  const horizontalSpacing = 450; // Más compacto para que los esposos estén cerca
  const verticalSpacing = 300;   // Más aire vertical para una caída elegante
  const levels = new Map();

  // Agrupar nodos por su nivel generacional
  nodes.forEach((node) => {
    const level = levelMap.get(node.id) ?? 0;
    if (!levels.has(level)) levels.set(level, []);
    levels.get(level).push(node);
  });

  const sortedLevels = Array.from(levels.keys()).sort((a, b) => a - b);
  const layoutedNodes = [];

  // Posicionar cada fila basándose en la posición de sus padres en el nivel anterior
  sortedLevels.forEach((level, levelIdx) => {
    const levelNodes = levels.get(level);
    const NODE_WIDTH = 150;

    if (levelIdx === 0) {
      // Nivel raíz: distribución simétrica estándar
      const totalWidth = (levelNodes.length - 1) * horizontalSpacing;
      const startX = -totalWidth / 2 - (NODE_WIDTH / 2);
      levelNodes.forEach((node, index) => {
        layoutedNodes.push({
          ...node,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          position: {
            x: startX + index * horizontalSpacing,
            y: level * verticalSpacing,
          }
        });
      });
    } else {
      // Niveles descendentes: posicionar hijos centrados bajo sus padres
      // y cónyuges "marry-in" al lado de su pareja
      
      const NODE_HALF = NODE_WIDTH / 2;
      
      // 1. Para cada nodo, buscar padres (aristas generacionales te-)
      const nodeInfo = levelNodes.map((node) => {
        const nodeId = node.id.toString();
        const parentNodes = layoutedNodes.filter(ln => {
          const lnId = ln.id.toString();
          return edges.some(e => {
            const eId = e.id?.toString() || '';
            // Solo aristas generacionales de PRIMER GRADO (Padre/Madre, offset=1)
            // Ignorar Abuelo (offset=2), Bisabuelo (offset=3) para no distorsionar el centrado
            if (!eId.startsWith('te')) return false;
            if (e.offset !== undefined && e.offset !== 1) return false;
            return e.target?.toString() === nodeId && e.source?.toString() === lnId;
          });
        });
        
        // Buscar cónyuge en el mismo nivel (aristas laterales tl-)
        const spouseInLevel = levelNodes.find(other => {
          if (other.id === node.id) return false;
          const otherId = other.id.toString();
          return edges.some(e => {
            const eId = e.id?.toString() || '';
            if (!eId.startsWith('tl')) return false;
            const s = e.source?.toString();
            const t = e.target?.toString();
            return (s === nodeId && t === otherId) || (s === otherId && t === nodeId);
          });
        });

        const parentIds = parentNodes.map(p => p.id).sort().join('|');
        let centerX = null;
        if (parentNodes.length > 0) {
          centerX = parentNodes.reduce((acc, p) => acc + p.position.x, 0) / parentNodes.length;
        }

        return { 
          node, 
          centerX, 
          parentIds, 
          hasParents: parentNodes.length > 0,
          spouseId: spouseInLevel ? spouseInLevel.id.toString() : null
        };
      });

      // 2. Primero posicionar los nodos que TIENEN padres (hijos legítimos)
      const withParents = nodeInfo.filter(n => n.hasParents);
      const withoutParents = nodeInfo.filter(n => !n.hasParents);
      
      // Agrupar hijos por familia (mismos padres)
      const familyGroups = new Map();
      withParents.forEach(info => {
        if (!familyGroups.has(info.parentIds)) familyGroups.set(info.parentIds, []);
        familyGroups.get(info.parentIds).push(info);
      });

      // Posicionar cada grupo de hermanos centrado bajo sus padres
      const positioned = new Map(); // nodeId -> x
      familyGroups.forEach((siblings) => {
        const centerX = siblings[0].centerX;
        const groupWidth = (siblings.length - 1) * horizontalSpacing;
        const startX = centerX - groupWidth / 2;
        siblings.forEach((sib, idx) => {
          positioned.set(sib.node.id.toString(), startX + idx * horizontalSpacing);
        });
      });

      // 3. Posicionar cónyuges SIN padres: al lado de su pareja
      withoutParents.forEach(info => {
        const nodeId = info.node.id.toString();
        if (positioned.has(nodeId)) return; // ya posicionado
        
        if (info.spouseId && positioned.has(info.spouseId)) {
          // Colocar al lado derecho del cónyuge
          positioned.set(nodeId, positioned.get(info.spouseId) + horizontalSpacing);
        } else {
          // Sin padres ni cónyuge posicionado: usar posición por defecto
          positioned.set(nodeId, 0);
        }
      });

      // 4. Recoger todas las posiciones y resolver solapamientos
      const finalPositions = levelNodes.map(node => ({
        node,
        x: positioned.get(node.id.toString()) ?? 0,
      }));
      
      finalPositions.sort((a, b) => a.x - b.x);

      // Resolver solapamientos manteniendo el orden relativo
      const minSep = horizontalSpacing * 0.7;
      for (let i = 1; i < finalPositions.length; i++) {
        if (finalPositions[i].x - finalPositions[i - 1].x < minSep) {
          finalPositions[i].x = finalPositions[i - 1].x + minSep;
        }
      }

      finalPositions.forEach((fp) => {
        layoutedNodes.push({
          ...fp.node,
          targetPosition: 'top',
          sourcePosition: 'bottom',
          position: {
            x: fp.x,
            y: level * verticalSpacing,
          }
        });
      });
    }
  });

  // Aristas Bezier para un look elegante y profesional
  const layoutedEdges = edges.map(edge => {
    const isUnionEdge = edge.id.toString().startsWith('ue-');
    const isToUnion = edge.target.toString().startsWith('union-');
    const isFromUnion = edge.source.toString().startsWith('union-');

    return {
      ...edge,
      type: 'smoothstep',
      animated: false,
      pathOptions: { borderRadius: 20 },
      style: {
        ...edge.style,
        strokeWidth: isUnionEdge ? 3 : 2,
      },
      // Quitar flecha si va hacia una unión
      markerEnd: isToUnion ? undefined : edge.markerEnd,
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

const normalizeRelationType = (tipoRelacion) => {
  if (!tipoRelacion) return '';
  let tipo = tipoRelacion.toLowerCase().trim();
  // Quitar sufijos comunes " de", " del", " de la", " de los", " de las"
  tipo = tipo.replace(/\s+de(\s+.*|$)/, '').replace(/\s+del(\s+.*|$)/, '').trim();
  return tipo;
};

const getParentChildDirection = (relation, parentGenderById = new Map()) => {
  const relationType = normalizeRelationType(relation.tipo_relacion);

  if (PARENT_RELATION_TYPES.has(relationType)) {
    const parentGenero = parentGenderById.get(relation.persona_id);
    const resolvedLabel = resolveParentLabelByGender(parentGenero, relation.tipo_relacion);
    const offset = ANCESTOR_RELATION_TYPES.get(relationType) || 1;

    return {
      parentId: relation.persona_id,
      childId: relation.persona_relacionada_id,
      label: resolvedLabel,
      offset,
    };
  }

  if (CHILD_RELATION_TYPES.has(relationType)) {
    const parentGenero = parentGenderById.get(relation.persona_relacionada_id);
    const genericLabel = CHILD_TO_PARENT_LABEL[relationType] || 'Ancestro';
    const offset = DESCENDANT_RELATION_TYPES.get(relationType) || 1;
    return {
      parentId: relation.persona_relacionada_id,
      childId: relation.persona_id,
      label: resolveParentLabelByGender(parentGenero, genericLabel),
      offset,
    };
  }

  // Manejo de colaterales para posicionamiento vertical
  if (LATERAL_LEVEL_TYPES.has(relationType)) {
    return {
      parentId: relation.persona_id,
      childId: relation.persona_relacionada_id,
      label: relation.tipo_relacion,
      offset: 0, // Mismo nivel
    };
  }

  return null;
};

export const buildTreeEdgesFromRelations = (relations, personas = []) => {
  const generationalEdges = [];
  const lateralEdges = [];
  const seenGenerational = new Set();
  const seenLateral = new Set();
  const parentGenderById = new Map(personas.map((p) => [p.id, p.Genero]));

  relations.forEach((rel) => {
    const directed = getParentChildDirection(rel, parentGenderById);
    
    // Normalizar etiquetas para evitar duplicados y mejorar legibilidad
    let normalizedLabel = rel.tipo_relacion;
    const normalizedType = normalizeRelationType(rel.tipo_relacion);
    if (['esposo', 'esposa', 'cónyuge', 'pareja'].includes(normalizedType)) {
      normalizedLabel = 'Esposos';
    } else if (['hermano', 'hermana'].includes(normalizedType)) {
      normalizedLabel = 'Hermanos';
    }

    // Si es una relación direccional con offset (padre/hijo/ancestro), la incluimos como generacional
    if (directed && directed.offset !== 0) {
      const directionalKey = `${directed.parentId}-${directed.childId}`;
      if (seenGenerational.has(directionalKey)) return;
      seenGenerational.add(directionalKey);

      generationalEdges.push({
        id: `te${directed.parentId}-${directed.childId}-${normalizedLabel.toLowerCase()}`,
        source: `${directed.parentId}`,
        target: `${directed.childId}`,
        label: directed.label, // Mantener el label original para parentesco directo (Padre/Madre/Hijo)
        tipo_relacion: rel.tipo_relacion,
        offset: directed.offset,
      });
      return;
    }

    // Para relaciones laterales (parejas, hermanos, etc.)
    if (rel.categoria !== 'familiar' && !directed) return;

    const source = `${rel.persona_id}`;
    const target = `${rel.persona_relacionada_id}`;
    if (source === target) return;

    const unorderedKey = [source, target].sort().join('-') + '-' + normalizedLabel.toLowerCase();
    if (seenLateral.has(unorderedKey)) return;
    seenLateral.add(unorderedKey);

    lateralEdges.push({
      id: `tl${source}-${target}-${normalizedLabel.toLowerCase()}`,
      source,
      target,
      label: normalizedLabel,
      tipo_relacion: normalizedLabel,
    });
  });

  return { generationalEdges, lateralEdges };
};

export const buildGenerationalLevels = (nodeIds, parentChildEdges, rootId = null) => {
  const childrenMap = new Map();
  const parentsMap = new Map();
  const inDegree = new Map();

  nodeIds.forEach((id) => {
    childrenMap.set(id, []);
    parentsMap.set(id, []);
    inDegree.set(id, 0);
  });

  // Mapa de offset por edge: source-target -> offset
  const edgeOffsetMap = new Map();
  parentChildEdges.forEach(({ source, target, offset = 1 }) => {
    if (!childrenMap.has(source) || !parentsMap.has(target)) return;
    childrenMap.get(source).push({ id: target, offset });
    parentsMap.get(target).push({ id: source, offset });
    inDegree.set(target, (inDegree.get(target) || 0) + 1);
    edgeOffsetMap.set(`${source}-${target}`, offset);
  });

  const levelMap = new Map();
  const roots = rootId
    ? [rootId]
    : nodeIds.filter((id) => (inDegree.get(id) || 0) === 0);

  const queue = [];
  roots.forEach((id) => {
    if (!levelMap.has(id)) {
      levelMap.set(id, 0);
      queue.push(id);
    }
  });

  const visited = new Set();
  const maxIterations = nodeIds.length * 5;
  let iterations = 0;

  while (queue.length && iterations < maxIterations) {
    iterations++;
    const current = queue.shift();
    const currentLevel = levelMap.get(current) || 0;

    (childrenMap.get(current) || []).forEach(({ id: childId, offset }) => {
      const nextLevel = currentLevel + offset;
      if (!levelMap.has(childId) || nextLevel > levelMap.get(childId)) {
        levelMap.set(childId, nextLevel);
        queue.push(childId);
      }
    });

    (parentsMap.get(current) || []).forEach(({ id: parentId, offset }) => {
      const prevLevel = currentLevel - offset;
      if (!levelMap.has(parentId) || prevLevel < levelMap.get(parentId)) {
        levelMap.set(parentId, prevLevel);
        queue.push(parentId);
      }
    });
  }

  nodeIds.forEach((id) => {
    if (!levelMap.has(id)) levelMap.set(id, 0);
  });

  // Ajustar todos los niveles para que el rootId (si existe) sea el nivel 0
  if (rootId && levelMap.has(rootId)) {
    const rootLevel = levelMap.get(rootId);
    if (rootLevel !== 0) {
      for (let [id, lvl] of levelMap.entries()) {
        levelMap.set(id, lvl - rootLevel);
      }
    }
  }

  return levelMap;
};

/**
 * Agrupa aristas generacionales para crear puntos de unión entre padres comunes.
 * Transforma A -> C y B -> C en A -> U, B -> U, U -> C.
 */
export const groupGenerationalEdges = (nodes, edges) => {
  const newNodes = [...nodes];
  const newEdges = [];
  
  // Separar aristas generacionales de las demás
  const genEdges = edges.filter(e => e.id.toString().startsWith('te'));
  const otherEdges = edges.filter(e => !e.id.toString().startsWith('te'));
  
  // Agrupar padres por cada hijo
  const childToParents = new Map();
  genEdges.forEach(edge => {
    const targetId = edge.target.toString();
    if (!childToParents.has(targetId)) childToParents.set(targetId, []);
    childToParents.get(targetId).push(edge);
  });
  
  const processedEdgeIds = new Set();
  const parentPairs = new Map(); // "p1-p2" -> { parentEdges: [e1, e2], children: [c1, c2, ...] }
  
  // Identificar parejas de padres
  childToParents.forEach((parents, childId) => {
    if (parents.length === 2) {
      const sortedParentIds = parents.map(p => p.source.toString()).sort();
      const pairKey = sortedParentIds.join('-');
      
      if (!parentPairs.has(pairKey)) {
        parentPairs.set(pairKey, { 
          parentEdges: parents, 
          children: [] 
        });
      }
      parentPairs.get(pairKey).children.push(childId);
      parents.forEach(p => processedEdgeIds.add(p.id.toString()));
    }
  });
  
  // Crear nodos de unión y nuevas aristas
  parentPairs.forEach((data, pairKey) => {
    const unionId = `union-${pairKey}`;
    
    // Crear nodo de unión (invisible/punto)
    newNodes.push({
      id: unionId,
      type: 'union',
      data: { label: '' },
      position: { x: 0, y: 0 },
      style: {
        width: 1,
        height: 1,
        background: 'transparent',
        border: 'none',
        padding: 0,
        opacity: 0,
      }
    });
    
    // Aristas de Padres -> Unión
    data.parentEdges.forEach(edge => {
      newEdges.push({
        ...edge,
        id: `ue-${edge.source}-${unionId}`,
        label: '', // Quitar etiqueta ("Padre"/"Madre") para no saturar el espacio
        style: {
          ...edge.style,
          stroke: getEdgeStyle(edge.tipo_relacion).color || '#5271FF',
          strokeWidth: 2
        }
      });
    });
    
    // Aristas de Unión -> Hijos
    data.children.forEach(childId => {
      const firstParentEdge = data.parentEdges[0];
      const edgeStyle = getEdgeStyle(firstParentEdge.tipo_relacion);
      
      newEdges.push({
        id: `ue-${unionId}-${childId}`,
        source: unionId,
        target: childId,
        label: '', // Quitar etiquetas redundantes en el tramo de unión
        tipo_relacion: firstParentEdge.tipo_relacion,
        categoria: 'familiar',
        style: {
          stroke: edgeStyle.color || '#5271FF',
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeStyle.color || '#5271FF',
        },
      });
    });
  });
  
  // Añadir aristas que no fueron procesadas (hijos con solo 1 padre visible, etc.)
  genEdges.forEach(edge => {
    if (!processedEdgeIds.has(edge.id.toString())) {
      newEdges.push(edge);
    }
  });
  
  // Añadir aristas laterales (cónyuges, etc.)
  newEdges.push(...otherEdges);
  
  return { nodes: newNodes, edges: newEdges };
};
