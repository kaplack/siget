import React from "react";
import { formatearFechaVisual } from "../utils/formatDate";

/**
 * Returns the column definitions for MaterialReactTable in ProjectSchedule.
 * @param {Function} handleSaveCell - Callback to save cell edits.
 */
export function getColumns(handleSaveCell) {
  return [
    {
      accessorKey: "edt",
      header: "EDT",
      enableEditing: false,
      size: 60,
    },
    {
      accessorKey: "nombre",
      header: "Actividad",
      enableEditing: false,
      Cell: ({ row, cell }) => (
        <div style={{ paddingLeft: `${(row.original.level - 1) * 10}px` }}>
          {cell.getValue()}
        </div>
      ),
    },
    {
      accessorKey: "plazo",
      header: "Plazo (días)",
      size: 40,
      enableEditing: (row) =>
        row.original.tipo === "seguimiento" && !row.original.children?.length,
      muiTableBodyCellEditTextFieldProps: {
        type: "number",
      },
      muiEditTextFieldProps: ({ cell, row }) => ({
        onBlur: (e) => {
          const value = e.target.value;
          handleSaveCell({ cell, row, value });
        },
      }),
    },
    {
      accessorKey: "fechaInicio",
      header: "Fecha Inicio",
      size: 80,
      enableEditing: (row) =>
        row.original.tipo === "seguimiento" && !row.original.children?.length,
      Cell: ({ cell }) => formatearFechaVisual(cell.getValue()),
      muiEditTextFieldProps: ({ cell, row }) => ({
        type: "date",
        value: cell.getValue() || "",
        onChange: (e) => {
          const value = e.target.value;
          handleSaveCell({ cell, row, value });
        },
      }),
    },
    {
      accessorKey: "fechaFin",
      header: "Fecha Fin",
      size: 80,
      enableEditing: (row) =>
        row.original.tipo === "seguimiento" && !row.original.children?.length,
      Cell: ({ cell }) => formatearFechaVisual(cell.getValue()),
      muiEditTextFieldProps: ({ cell, row }) => ({
        type: "date",
        value: cell.getValue() || "",
        onChange: (e) => {
          const value = e.target.value;
          handleSaveCell({ cell, row, value });
        },
      }),
    },
    {
      accessorKey: "responsable",
      header: "Responsable",
      size: 150,
      enableEditing: false,
    },
    {
      accessorKey: "predecesorId",
      header: "Predecesor",
      size: 80,
      enableEditing: (row) =>
        row.original.tipo === "seguimiento" && !row.original.children?.length,
      muiTableBodyCellEditTextFieldProps: {
        type: "text",
      },
      muiEditTextFieldProps: ({ cell, row }) => ({
        onBlur: (e) => {
          const value = e.target.value;
          handleSaveCell({ cell, row, value });
        },
      }),
    },
    {
      accessorKey: "avance",
      header: "Avance (%)",
      size: 80,
      enableEditing: (row) =>
        row.original.tipo === "seguimiento" && !row.original.children?.length,
      muiTableBodyCellEditTextFieldProps: {
        type: "number",
      },
      muiEditTextFieldProps: ({ cell, row }) => ({
        onBlur: (e) => {
          const value = e.target.value;
          handleSaveCell({ cell, row, value });
        },
      }),
    },
    {
      accessorKey: "sustento",
      header: "Sustento (URL)",
      size: 120,
      enableEditing: (row) => row.original.tipo === "seguimiento",
      muiTableBodyCellEditTextFieldProps: {
        type: "url",
      },
      muiEditTextFieldProps: ({ cell, row }) => ({
        onBlur: (e) => {
          const value = e.target.value;
          handleSaveCell({ cell, row, value });
        },
      }),
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
  ];
}
