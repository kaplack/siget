// Programacion.jsx con EDT dinámico y preparación para drag and drop
import React, { useState, useEffect, useMemo } from "react";
import {
  MaterialReactTable,
  MRT_ActionMenuItem,
  useMaterialReactTable,
} from "material-react-table";
import { buildTree } from "../utils/buildTree";
import { Button, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

let lastId = 8;

const initialData = [
  {
    id: 1,
    parentId: 0,
    nombre: "Formulación",
    fechaInicio: "2025-06-01",
    fechaFin: "2025-06-10",
    responsable: "Juan Pérez",
    predecesorId: null,
    avance: 0,
    plazo: 10,
    sustento: "",
    orden: 1,
  },
  {
    id: 4,
    parentId: 0,
    nombre: "Ejecución",
    fechaInicio: "2025-06-15",
    fechaFin: "2025-07-15",
    responsable: "Marta Ruiz",
    predecesorId: null,
    avance: 0,
    plazo: 30,
    sustento: "",
    orden: 2,
  },
  {
    id: 2,
    parentId: 1,
    nombre: "Revisión técnica",
    fechaInicio: "2025-06-02",
    fechaFin: "2025-06-05",
    responsable: "Ana Gómez",
    predecesorId: 1,
    avance: 0,
    plazo: 5,
    sustento: "",
    orden: 1,
  },
  {
    id: 3,
    parentId: 2,
    nombre: "Validación presupuesto",
    fechaInicio: "2025-06-06",
    fechaFin: "2025-06-08",
    responsable: "Carlos Díaz",
    predecesorId: 2,
    avance: 0,
    plazo: 3,
    sustento: "",
    orden: 1,
  },
  {
    id: 5,
    parentId: 4,
    nombre: "Licitación de obra",
    fechaInicio: "2025-06-15",
    fechaFin: "2025-06-25",
    responsable: "Luis Torres",
    predecesorId: 4,
    avance: 0,
    plazo: 10,
    sustento: "",
    orden: 1,
  },
  {
    id: 6,
    parentId: 4,
    nombre: "Firma de contrato",
    fechaInicio: "2025-06-26",
    fechaFin: "2025-06-28",
    responsable: "Laura Méndez",
    predecesorId: 5,
    avance: 0,
    plazo: 3,
    sustento: "",
    orden: 2,
  },
  {
    id: 7,
    parentId: 5,
    nombre: "Publicación de bases",
    fechaInicio: "2025-06-15",
    fechaFin: "2025-06-18",
    responsable: "Equipo Legal",
    predecesorId: 5,
    avance: 0,
    plazo: 4,
    sustento: "",
    orden: 1,
  },
  {
    id: 8,
    parentId: 5,
    nombre: "Evaluación de propuestas",
    fechaInicio: "2025-06-19",
    fechaFin: "2025-06-24",
    responsable: "Comité Técnico",
    predecesorId: 7,
    avance: 0,
    plazo: 5,
    sustento: "",
    orden: 2,
  },
];

// Generate visual EDT from parentId structure
const generarEDTs = (nodes, parentId = 0, prefix = "") => {
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

const Programacion = () => {
  const [data, setData] = useState([]);

  const flattenTree = (tree) => {
    const result = [];
    const flatten = (nodes) => {
      nodes.forEach((node) => {
        const { children, ...rest } = node;
        result.push(rest);
        if (children?.length > 0) flatten(children);
      });
    };
    flatten(tree);
    return result;
  };

  const actualizarArbolConEDT = (listaPlana) => {
    const tree = buildTree(listaPlana);
    generarEDTs(tree); // Mutación en sitio
    return tree;
  };

  useEffect(() => {
    const treeData = actualizarArbolConEDT(initialData);
    setData(treeData);
  }, []);

  const handleSaveCell = ({ cell, row, value }) => {
    const columnId = cell.column.id;
    if (columnId === "avance") {
      const parsed = parseInt(value);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        alert("El avance debe ser un número entre 0 y 100.");
        return;
      }
      value = parsed;
    }

    if (columnId === "fechaInicio" || columnId === "fechaFin") {
      const nuevaFecha = new Date(value);
      const otraFecha =
        columnId === "fechaInicio"
          ? new Date(row.original.fechaFin)
          : new Date(row.original.fechaInicio);

      if (
        row.original.fechaInicio &&
        row.original.fechaFin &&
        ((columnId === "fechaInicio" && nuevaFecha > otraFecha) ||
          (columnId === "fechaFin" && nuevaFecha < otraFecha))
      ) {
        alert(
          "La fecha de inicio no puede ser posterior a la fecha de fin, ni viceversa."
        );
        return;
      }
    }

    const updateRow = (rows) =>
      rows.map((item) =>
        item.id === row.original.id
          ? { ...item, [columnId]: value }
          : item.children?.length > 0
          ? { ...item, children: updateRow(item.children) }
          : item
      );

    const updatedTree = updateRow(data);
    const newTree = actualizarArbolConEDT(flattenTree(updatedTree));
    setData(newTree);
  };

  const handleAddActivity = (parentId = 0) => {
    lastId += 1;
    const flatData = flattenTree(data);

    // Find the highest `orden` among siblings
    const ordenMax = Math.max(
      0,
      ...flatData
        .filter((item) => item.parentId === parentId)
        .map((item) => item.orden ?? 0)
    );

    flatData.push({
      id: lastId,
      parentId,
      nombre: "Nueva Actividad",
      fechaInicio: "",
      fechaFin: "",
      responsable: "",
      predecesorId: null,
      avance: 0,
      plazo: 0,
      sustento: "",
      orden: ordenMax + 1,
    });

    const newTree = actualizarArbolConEDT(flatData);
    setData(newTree);
  };

  const handleDelete = (id) => {
    const flatData = flattenTree(data);

    // Buscar IDs de todos los descendientes del nodo
    const collectDescendants = (parentId) => {
      const children = flatData.filter((item) => item.parentId === parentId);
      return children.flatMap((child) => [
        child.id,
        ...collectDescendants(child.id),
      ]);
    };

    const idsToDelete = [id, ...collectDescendants(id)];

    const filtered = flatData.filter((item) => !idsToDelete.includes(item.id));
    const newTree = actualizarArbolConEDT(filtered);
    setData(newTree);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "drag",
        header: "",
        enableColumnActions: false,
        enableSorting: false,
        size: 20,
        enableEditing: false,
        Cell: ({ row }) => {
          const { attributes, listeners, setNodeRef, transform, transition } =
            useSortable({ id: row.original.id.toString() });

          const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            cursor: "grab",
            display: "flex",
            alignItems: "center",
          };

          return (
            <span
              ref={setNodeRef}
              {...attributes}
              {...listeners}
              style={style}
              title="Arrastrar"
            >
              <DragIndicatorIcon fontSize="small" />
            </span>
          );
        },
      },

      {
        accessorKey: "edt",
        header: "EDT",
        size: 60,
        enableEditing: false,
      },
      {
        accessorKey: "nombre",
        header: "Actividad",
        Cell: ({ row, cell }) => (
          <div style={{ paddingLeft: `${(row.original.level - 1) * 10}px` }}>
            {cell.getValue()}
          </div>
        ),
        muiTableBodyCellEditTextFieldProps: { required: true },
      },
      {
        accessorKey: "plazo",
        header: "Plazo (días)",
        muiTableBodyCellEditTextFieldProps: { type: "number" },
        size: 40,
      },
      {
        accessorKey: "fechaInicio",
        header: "Fecha Inicio",
        muiTableBodyCellEditTextFieldProps: { type: "date" },
        size: 80,
      },
      {
        accessorKey: "fechaFin",
        header: "Fecha Fin",
        muiTableBodyCellEditTextFieldProps: { type: "date" },
        size: 80,
      },
      { accessorKey: "responsable", header: "Responsable", size: 150 },
      {
        accessorKey: "predecesorId",
        header: "Predecesor",
        muiTableBodyCellEditTextFieldProps: { type: "number" },
        size: 80,
      },
      {
        accessorKey: "avance",
        header: "Avance (%)",
        muiTableBodyCellEditTextFieldProps: { type: "number" },
        size: 80,
      },
      {
        accessorKey: "sustento",
        header: "Sustento (URL)",
        muiTableBodyCellEditTextFieldProps: { type: "url" },
        size: 80,
        Cell: ({ cell }) => {
          const url = cell.getValue();
          if (!url) return null;
          return (
            <a href={url} target="_blank" rel="noopener noreferrer">
              Ver Sustento
            </a>
          );
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableEditing: true,
    editDisplayMode: "cell",
    enableExpanding: true,
    getSubRows: (row) => row.children,
    enableRowActions: true,
    positionActionsColumn: "last",
    displayColumnDefOptions: { "mrt-row-actions": { enableEditing: false } },
    enableCellActions: true,
    initialState: {
      columnVisibility: { id: false, responsable: false, predecesorId: false },
    },
    muiTableBodyCellProps: ({ cell, row }) => ({
      onKeyDown: (event) => {
        if (event.key === "F2") {
          table.setEditingCell(cell);
          setTimeout(() => {
            const input = document.querySelector("input.MuiInputBase-input");
            if (input) input.focus();
          }, 0);
        }
        if (event.key === "Delete") {
          table.setEditingCell(cell);
          setTimeout(() => {
            const input = document.querySelector("input.MuiInputBase-input");
            if (input) {
              input.focus();
              input.select();
            }
          }, 0);
        }
      },
      tabIndex: 0,
    }),
    muiTableBodyRowProps: ({ row }) => ({
      id: row.original.id.toString(),
      sx:
        row.original.level === 1
          ? {
              backgroundColor: "#f0f4ff",
              fontWeight: "bold",
              fontSize: "1rem",
              color: "#1a237e",
            }
          : {},
      // style: { cursor: "grab" },
      onKeyDown: (event) => {
        if (event.key.toLowerCase() === "a") {
          const newParentId = event.shiftKey ? 0 : row.original.parentId ?? 0;
          handleAddActivity(newParentId);
        }
        if (event.key.toLowerCase() === "s") {
          handleAddActivity(row.original.id);
        }
      },
    }),

    defaultColumn: {
      muiTableBodyEditTextFieldProps: { autoFocus: true },
    },
    renderCellActionMenuItems: ({ row, closeMenu }) => [
      <Divider key="divider" />,
      <MRT_ActionMenuItem
        key="add-sub"
        icon={<AddIcon />}
        label="Agregar Subactividad"
        onClick={() => {
          handleAddActivity(row.original.id);
          closeMenu();
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="delete"
        icon={<DeleteIcon />}
        label="Eliminar"
        onClick={() => {
          handleDelete(row.original.id);
          closeMenu();
        }}
        table={table}
      />,
    ],
    onEditingCellSave: handleSaveCell,
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over, activatorEvent } = event;

    if (!over || active.id === over.id) return;

    const shiftPressed = activatorEvent?.shiftKey;
    const flat = flattenTree(data);
    const draggedItem = flat.find((item) => item.id === parseInt(active.id));
    const targetItem = flat.find((item) => item.id === parseInt(over.id));

    if (!draggedItem || !targetItem) return;

    const updated = flat.map((item) => ({ ...item }));

    const sameParent = draggedItem.parentId === targetItem.parentId;

    if (!shiftPressed && sameParent) {
      // 🔁 Reorder among siblings
      const siblings = updated.filter(
        (i) => i.parentId === draggedItem.parentId
      );

      siblings.sort((a, b) => a.orden - b.orden);
      const fromIndex = siblings.findIndex((i) => i.id === draggedItem.id);
      const toIndex = siblings.findIndex((i) => i.id === targetItem.id);

      const [moved] = siblings.splice(fromIndex, 1);
      siblings.splice(toIndex, 0, moved);

      siblings.forEach((item, index) => {
        const ref = updated.find((i) => i.id === item.id);
        if (ref) ref.orden = index + 1;
      });
    } else {
      // 🔽 Move dragged item to be a child of targetItem

      // 🚫 Check for cycles
      const tree = buildTree(flat);
      const findNode = (nodes, id) => {
        for (let n of nodes) {
          if (n.id === id) return n;
          if (n.children) {
            const found = findNode(n.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const draggedNode = findNode(tree, draggedItem.id);
      const containsTarget = (node, targetId) => {
        if (!node) return false;
        if (node.id === targetId) return true;
        if (!node.children) return false;
        return node.children.some(
          (child) =>
            containsTarget(child, targetId) ||
            containsTarget(child.children, targetId)
        );
      };

      if (containsTarget(draggedNode, targetItem.id)) {
        alert(
          "No puedes mover una actividad dentro de su propia subactividad."
        );
        return;
      }

      // ✅ Change parentId and assign new orden at end of sibling list
      const newParentId = targetItem.id;
      const maxOrden = Math.max(
        0,
        ...updated
          .filter((i) => i.parentId === newParentId)
          .map((i) => i.orden ?? 0)
      );

      updated.forEach((item) => {
        if (item.id === draggedItem.id) {
          item.parentId = newParentId;
          item.orden = maxOrden + 1;
        }
      });
    }

    const newTree = actualizarArbolConEDT(updated);
    setData(newTree);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Programación WBS (SIGET PRO v5.2)
      </h2>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleAddActivity(0)}
        sx={{ mb: 2 }}
      >
        + Agregar Actividad Principal
      </Button>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={flattenTree(data).map((item) => item.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <MaterialReactTable table={table} />
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Programacion;
