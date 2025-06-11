// /utils/buildTree.js

export function buildTree(items) {
  const lookup = {};
  const root = [];
  const orphans = [];

  // Crear lookup
  items.forEach((item) => {
    lookup[item.id] = { ...item, children: [] };
  });

  // Relacionar padres e hijos
  items.forEach((item) => {
    if (item.parentId === 0) {
      root.push(lookup[item.id]);
    } else if (!lookup[item.parentId]) {
      console.warn(
        `WARNING: parentId ${item.parentId} not found for item id ${item.id}`
      );
      orphans.push(lookup[item.id]);
    } else {
      lookup[item.parentId].children.push(lookup[item.id]);
    }
  });

  // ✅ Ordenar los hijos por campo `orden`
  function sortChildren(nodes) {
    nodes.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  }

  sortChildren(root); // aplica orden recursivo

  // Detectar ciclos
  const visited = new Set();

  function detectCycle(node, path = []) {
    if (visited.has(node.id)) {
      throw new Error(`CYCLE DETECTED: ${path.join(" -> ")} -> ${node.id}`);
    }
    visited.add(node.id);
    path.push(node.id);

    node.children.forEach((child) => {
      detectCycle(child, [...path]);
    });

    visited.delete(node.id);
  }

  root.forEach((node) => detectCycle(node));

  if (orphans.length > 0) {
    console.warn("ORPHAN ITEMS DETECTED:", orphans);
  }

  // Asignar niveles
  function assignLevels(nodes, level = 1) {
    nodes.forEach((node) => {
      node.level = level;
      if (node.children.length > 0) {
        assignLevels(node.children, level + 1);
      }
    });
  }

  assignLevels(root);

  return root;
}
