/* utils/activityUtils.js */

// Generate visual EDT from parentId structure
export const generarEDTs = (nodes, parentId = 0, prefix = "") => {
  let counter = 1;
  nodes.forEach((node) => {
    if (node.parentId === parentId) {
      const currentEDT = prefix ? `${prefix}.${counter}` : `${counter}`;
      node.edt = currentEDT;
      if (node.children?.length) {
        generarEDTs(node.children, node.id, currentEDT);
      }
      counter++;
    }
  });
};

/**
 * Merge pending local changes into the tree of activities.
 * Ensures children arrays are processed recursively.
 * @param {Array<Object>} nodes - The base tree (array of nodes)
 * @param {Object<string, Object>} changes - localChanges keyed by node id
 * @returns {Array<Object>} new tree with changes applied
 */
export function aplicarCambiosLocales(nodes = [], changes = {}) {
  if (!Array.isArray(nodes)) {
    return [];
  }
  return nodes.map((node) => {
    // Merge any pending changes for this node
    const diff = changes[node.id] || {};
    const updatedNode = { ...node, ...diff };

    // Recurse into children if they exist
    if (Array.isArray(node.children)) {
      updatedNode.children = aplicarCambiosLocales(node.children, changes);
    }
    return updatedNode;
  });
}
// Calculate weighted average progress for each node
export const calcularAvanceRecursivo = (nodo) => {
  if (!nodo.children || nodo.children.length === 0) return nodo.avance || 0;
  console.log(nodo.children);
  const avances = [];
  const pesos = [];
  nodo.children.forEach((child) => {
    const avanceHijo = calcularAvanceRecursivo(child);
    const peso = child.plazo || 0;
    if (peso > 0) {
      avances.push(avanceHijo);
      pesos.push(peso);
    }
  });
  const totalPeso = pesos.reduce((sum, p) => sum + p, 0);
  if (totalPeso === 0) return 0;
  const avancePonderado =
    avances.reduce((sum, a, i) => sum + a * pesos[i], 0) / totalPeso;
  nodo.avance = Math.round(avancePonderado);
  return nodo.avance;
};

// Calculate total duration from leaf nodes only
export const calcularPlazoHojas = (nodos) => {
  const hojas = [];
  const buscar = (n) => {
    if (!n.children || n.children.length === 0) hojas.push(n);
    else n.children.forEach(buscar);
  };
  nodos.forEach(buscar);
  return hojas.reduce((sum, h) => sum + (h.plazo || 0), 0);
};

/**
 * Flatten a hierarchical tree of nodes into a flat array.
 * @param {Array<Object>} nodes - The tree to flatten
 * @returns {Array<Object>} flat array of nodes
 */
export function flattenTree(nodes = []) {
  const result = [];
  if (!Array.isArray(nodes)) {
    return result;
  }

  for (const node of nodes) {
    result.push(node);
    if (Array.isArray(node.children)) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}
