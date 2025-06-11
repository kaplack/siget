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
  },
];

const Programacion = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const treeData = buildTree(initialData);
    setData(treeData);
  }, []);

  const flattenTree = (tree) => {
    const result = [];
    const flatten = (nodes) => {
      nodes.forEach((node) => {
        const { children, ...rest } = node;
        result.push(rest);
        if (children.length > 0) flatten(children);
      });
    };
    flatten(tree);
    return result;
  };

  const handleSaveCell = ({ cell, row, value }) => {
    if (cell.column.id === "avance") {
      const parsed = parseInt(value);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        alert("El avance debe ser un número entre 0 y 100.");
        return;
      }
      value = parsed;
    }
    const updateRow = (rows) =>
      rows.map((item) =>
        item.id === row.original.id
          ? { ...item, [cell.column.id]: value }
          : item.children?.length > 0
          ? { ...item, children: updateRow(item.children) }
          : item
      );

    setData(updateRow(data));
  };

  const handleAddActivity = (parentId = 0) => {
    lastId += 1;
    const flatData = flattenTree(data);
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
    });
    const newTree = buildTree(flatData);
    setData(newTree);
  };

  const handleDelete = (id) => {
    const flatData = flattenTree(data);
    const filtered = flatData.filter((item) => item.id !== id);
    const newTree = buildTree(filtered);
    setData(newTree);
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID", enableEditing: false, size: 60 },
      {
        accessorKey: "nombre",
        header: "Actividad",
        Cell: ({ row, cell }) => (
          <div style={{ paddingLeft: `${(row.original.level - 1) * 20}px` }}>
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
      columnVisibility: { responsable: false, predecesorId: false },
    },
    muiTableBodyCellProps: ({ cell, row }) => ({
      onKeyDown: (event) => {
        if (event.key === "F2") {
          table.setEditingCell(cell);
          setTimeout(() => {
            const input = document.querySelector("input.MuiInputBase-input");
            if (input) {
              input.focus();
            }
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
      sx:
        row.original.level === 1
          ? {
              backgroundColor: "#f0f4ff",
              fontWeight: "bold",
              fontSize: "1rem",
              color: "#1a237e",
            }
          : {},
      onKeyDown: (event) => {
        if (event.key === "A" || event.key === "a") {
          const newParentId = event.shiftKey ? 0 : row.original.parentId ?? 0;
          handleAddActivity(newParentId);
        }
        if (event.key === "S" || event.key === "s") {
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
      <MaterialReactTable table={table} />
    </div>
  );
};

export default Programacion;
