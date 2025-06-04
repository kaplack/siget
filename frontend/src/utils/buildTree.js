export function buildTree(items) {
  const lookup = {};
  const root = [];

  // Armamos el mapa rápido de los items
  items.forEach((item) => {
    lookup[item.id] = { ...item, children: [] };
  });

  // Enlazamos padres e hijos
  items.forEach((item) => {
    if (item.parentId) {
      lookup[item.parentId].children.push(lookup[item.id]);
    } else {
      root.push(lookup[item.id]);
    }
  });

  return root;
}
//   };
