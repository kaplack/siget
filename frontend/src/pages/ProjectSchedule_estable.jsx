// ProjectSchedule.jsx  con EDT dinámico y preparación para drag and drop
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { buildTree } from "../utils/buildTree";
import { Button } from "@mui/material";

import { formatearFechaVisual } from "../utils/formatDate";

import { useDispatch, useSelector } from "react-redux";
import {
  getActivitiesByProject,
  updateDraftActivity,
  addTrackingVersion,
} from "../features/activities/activitySlice";
import { getProject, updateProject } from "../features/projects/projectSlice";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaRegSave } from "react-icons/fa";
import {
  recalcularFechasPadres,
  calcularTerceraVariable,
} from "../utils/workingDay";
import {
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
} from "material-react-table";
import {
  generarEDTs,
  aplicarCambiosLocales,
  calcularAvanceRecursivo,
  calcularPlazoHojas,
  flattenTree,
} from "../utils/activityUtils";

const ProjectSchedule = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState({});

  const [localChanges, setLocalChanges] = useState({});

  const rawActivities = useSelector((state) => state.activities.activities);
  const currentProject = useSelector((state) => state.project.project);

  // Solo al montar: carga inicial de proyecto y actividades de seguimiento
  useEffect(() => {
    if (!projectId) return;

    dispatch(getProject(projectId));
    dispatch(getActivitiesByProject({ projectId, tipoVersion: "seguimiento" }));
  }, [projectId]);

  // Cada vez que cambian las actividades, reconstruye el árbol y aplica cambios locales pendientes
  useEffect(() => {
    if (!rawActivities || rawActivities.length === 0) return;

    const tree = buildTree(rawActivities);
    generarEDTs(tree);
    recalcularFechasPadres(tree);
    tree.forEach(calcularAvanceRecursivo);

    setData(tree); // solo backend, sin aplicar cambios locales aquí
  }, [rawActivities]);

  // Warn user before leaving the page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(localChanges).length > 0) {
        e.preventDefault();
        e.returnValue =
          "Estás a punto de salir del navegador. Podrías perder información no guardada.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [localChanges]);

  // Manual save of all pending changes
  const handleGuardarTodo = async () => {
    if (!currentProject?.firmaConvenio) {
      toast.warning(
        "No se puede guardar el seguimiento. Debe registrar primero la fecha de firma del convenio."
      );
      setLocalChanges({});
      try {
        await dispatch(
          getActivitiesByProject({ projectId, tipoVersion: "seguimiento" })
        );
      } catch (err) {
        toast.error("Error al recargar actividades.");
        console.error(err);
      }
      return;
    }

    const cambiosPendientes = localChanges;

    if (Object.keys(cambiosPendientes).length === 0) {
      toast.info("No hay cambios pendientes por guardar.");
      return;
    }

    const promesas = Object.entries(cambiosPendientes).map(([rowId, data]) =>
      dispatch(addTrackingVersion({ activityId: rowId, versionData: data }))
        .unwrap()
        .catch((err) => {
          toast.error(`Error al guardar actividad ID ${rowId}`);
          console.error(`❌ ID ${rowId}:`, err);
        })
    );

    await Promise.allSettled(promesas);

    try {
      await dispatch(
        getActivitiesByProject({ projectId, tipoVersion: "seguimiento" })
      );
    } catch (err) {
      toast.error("Error al recargar actividades luego del guardado.");
      console.error(err);
    }

    setLocalChanges({});

    try {
      const avanceProyecto = calcularAvanceRecursivo({ children: data });
      const plazoSeguimiento = calcularPlazoHojas(data);

      await dispatch(
        updateProject({
          id: projectId,
          updatedData: { avance: avanceProyecto, plazoSeguimiento },
        })
      );
    } catch (err) {
      toast.error("Error al actualizar el avance del proyecto.");
      console.error(err);
    }
  };

  // Updated handleSaveCell with autosave logic per row
  const handleSaveCell = ({ cell, row, value }) => {
    const columnId = cell.column.id;
    //const tipo = row.original.tipo;
    const rowId = row.original.id;

    const camposPermitidos = [
      "plazo",
      "fechaInicio",
      "fechaFin",
      "avance",
      "sustento",
    ];

    // ⛔ Solo permitir edición de campos permitidos
    if (!camposPermitidos.includes(columnId)) {
      toast.warning(
        "Este campo no puede ser editado en seguimiento. Solo: plazo, fechas, avance, sustento."
      );
      return;
    }

    // 🧮 Validación de avance
    if (columnId === "avance") {
      const parsed = parseInt(value);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        toast.warning("El avance debe ser un número entre 0 y 100.");
        return;
      }
      value = parsed;
    }

    // ⛔ Validar fecha
    if (columnId === "fechaInicio" || columnId === "fechaFin") {
      if (value === "Invalid date") return;
      const nuevaFecha = new Date(value);
      if (isNaN(nuevaFecha.getTime())) return;
    }

    // ⛔ Evitar guardar si no cambió
    if (row.original[columnId] === value) return;

    // 🧠 Aplicar lógica de fechas si corresponde
    const nodoActual = flattenTree(data).find((n) => n.id === rowId);
    let entrada = { ...nodoActual, [columnId]: value };
    const esFecha = ["fechaInicio", "fechaFin", "plazo"].includes(columnId);

    if (esFecha) {
      const resultado = calcularTerceraVariable(
        {
          fechaInicio: entrada.fechaInicio,
          fechaFin: entrada.fechaFin,
          plazo: entrada.plazo,
        },
        [], // feriados si se usan
        columnId
      );
      entrada = { ...entrada, ...resultado };
    }

    // 🧱 Actualizar árbol local
    const updateRow = (rows) =>
      rows.map((item) => {
        const esEditado = item.id === row.original.id;
        if (esEditado) {
          console.log("✏️ Actualizando nodo:", item);
          console.log("➡️ Nuevo estado:", entrada);
          return { ...item, ...entrada };
        }

        if (item.children?.length > 0) {
          const updatedChildren = updateRow(item.children);
          console.log("🔁 Nodo padre:", item.id, "→ hijos:", updatedChildren);
          return { ...item, children: updatedChildren };
        }

        return item;
      });

    console.log("como entra data al updateRow:", data);
    const updatedTree = updateRow(data);
    const flattened = flattenTree(updatedTree);
    const rebuiltTree = buildTree(flattened);
    generarEDTs(rebuiltTree);
    recalcularFechasPadres(rebuiltTree);
    rebuiltTree.forEach(calcularAvanceRecursivo);
    const finalTree = aplicarCambiosLocales(rebuiltTree, localChanges);
    console.log(
      "handleSaveCell antes de renderizar el arbol con cambios",
      finalTree
    );
    setData(finalTree);

    console.log(
      "✅ Visual actualizado con avance:",
      entrada.avance,
      "para ID",
      rowId
    );
    console.log(
      "📦 Data actual:",
      finalTree.find((r) => r.id === rowId)
    );

    setLocalChanges((prev) => ({
      ...prev,
      [rowId]: {
        ...(prev[rowId] || {}),
        ...(esFecha
          ? {
              fechaInicio: entrada.fechaInicio,
              fechaFin: entrada.fechaFin,
              plazo: entrada.plazo,
            }
          : {
              [columnId]: value,
            }),
      },
    }));
  };

  // 5 minutes 5 * 60 * 1000
  const columns = useMemo(
    () => [
      {
        accessorKey: "edt",
        header: "EDT",
        size: 60,
        enableEditing: false,
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
        muiTableBodyCellEditTextFieldProps: { required: true },
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          onBlur: (event) => {
            const value = event.target.value;
            // Solo guardar si hay cambio real
            if (value !== row.original[cell.column.id]) {
              handleSaveCell({ cell, row, value });
            }
          },
        }),
      },
      {
        accessorKey: "plazo",
        header: "Plazo (días)",
        enableEditing: (row) =>
          row.original.tipo === "seguimiento" &&
          (!row.original.children || row.original.children.length === 0),
        muiTableBodyCellEditTextFieldProps: { type: "number" },
        size: 40,
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          onBlur: (event) => {
            const value = event.target.value;
            console.log(
              "value:",
              value,
              typeof value,
              "new value:",
              typeof row.original[cell.column.id],
              row.original[cell.column.id]
            );
            // Solo guardar si hay cambio real
            if (value !== row.original[cell.column.id]) {
              console.log(
                "value:",
                value,
                "new value:",
                row.original[cell.column.id]
              );
              handleSaveCell({ cell, row, value });
            }
          },
        }),
      },
      {
        accessorKey: "fechaInicio",
        header: "Fecha Inicio",
        enableEditing: (row) =>
          row.original.tipo === "seguimiento" &&
          (!row.original.children || row.original.children.length === 0),
        size: 80,
        Cell: ({ cell }) => formatearFechaVisual(cell.getValue()),
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          type: "date",
          defaultValue: cell.getValue(),
          onBlur: (event) => {
            const value = event.target.value;
            // Solo guardar si hay cambio real
            if (value !== row.original[cell.column.id]) {
              handleSaveCell({ cell, row, value });
            }
          },
        }),
      },
      {
        accessorKey: "fechaFin",
        header: "Fecha Fin",
        enableEditing: (row) =>
          row.original.tipo === "seguimiento" &&
          (!row.original.children || row.original.children.length === 0),
        size: 80,

        Cell: ({ cell }) => formatearFechaVisual(cell.getValue()),
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          type: "date",
          defaultValue: cell.getValue(),
          onBlur: (event) => {
            const value = event.target.value;
            // Solo guardar si hay cambio real
            if (value !== row.original[cell.column.id]) {
              handleSaveCell({ cell, row, value });
            }
          },
        }),
      },
      { accessorKey: "responsable", header: "Responsable", size: 150 },
      {
        accessorKey: "predecesorId",
        header: "Predecesor",
        muiTableBodyCellEditTextFieldProps: { type: "number" },

        size: 80,
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          onBlur: (event) => {
            const value = event.target.value;
            // Solo guardar si hay cambio real
            if (value !== row.original[cell.column.id]) {
              handleSaveCell({ cell, row, value });
            }
          },
        }),
      },
      {
        accessorKey: "avance",
        header: "Avance (%)",
        muiTableBodyCellEditTextFieldProps: { type: "number" },
        enableEditing: (row) =>
          row.original.tipo === "seguimiento" &&
          (!row.original.children || row.original.children.length === 0),
        size: 80,
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          onBlur: (event) => {
            const value = event.target.value;
            // Solo guardar si hay cambio real
            if (value !== row.original[cell.column.id]) {
              handleSaveCell({ cell, row, value });
            }
          },
        }),
      },
      {
        accessorKey: "sustento",
        header: "Sustento (URL)",
        muiTableBodyCellEditTextFieldProps: { type: "url" },
        enableEditing: true,
        size: 80,
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          onBlur: (event) => {
            const value = event.target.value;
            // Solo guardar si hay cambio real
            if (value !== row.original[cell.column.id]) {
              handleSaveCell({ cell, row, value });
            }
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
    ],
    [currentProject, data]
  );

  const dataToRender = useMemo(
    () => aplicarCambiosLocales(data, localChanges),
    [data, localChanges]
  );

  const table = useMaterialReactTable({
    columns,
    data: dataToRender,
    enableStickyHeader: true,
    enableEditing: true,
    editDisplayMode: "cell",
    enableExpanding: true,
    getSubRows: (row) => row.children,
    state: { expanded },
    onExpandedChange: setExpanded,
    getRowId: (row, index, parent) =>
      parent ? `${parent.id}.${index}` : `${index}`,
    getRowCanExpand: (row) => !!row.original.children?.length,
    enableSorting: false,
    enableColumnActions: false,
    //enableRowActions: true,
    positionActionsColumn: "last",

    enableCellActions: true,
    displayColumnDefOptions: {
      "mrt-row-expand": {
        size: 30, // ancho deseado en px (ajústalo a lo que necesites)
        maxSize: 35,
        minSize: 25,
      },
    },
    initialState: {
      columnVisibility: { id: false, responsable: false, predecesorId: false },

      pagination: { pageSize: 100 },
    },
    renderToolbarInternalActions: ({ table }) => (
      <>
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
      </>
    ),
    renderTopToolbarCustomActions: () => (
      <div className="d-flex align-items-center gap-2">
        <Button variant="contained" color="primary" onClick={handleGuardarTodo}>
          <FaRegSave size={23} />
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/app/project-list/${projectId}/base-line`)}
        >
          Ver Linea Base
        </Button>
      </div>
    ),

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
    muiTableBodyRowProps: ({ row }) => {
      const isEdited = localChanges[row.original.id];

      return {
        sx: {
          ...(row.original.level === 1
            ? {
                backgroundColor: "#f0f4ff",
                fontWeight: "bold",
                fontSize: "1rem",
                color: "#1a237e",
              }
            : {}),
          ...(isEdited && {
            backgroundColor: "#fff3e0", // color para cambios no guardados
          }),
        },
      };
    },
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Seguimiento de Actividades</h2>
      <h4>{currentProject?.alias}</h4>
      <p>
        {currentProject?.cui && `CUI: ${currentProject.cui} `}
        {currentProject?.ci && `CI: ${currentProject.ci}`}
      </p>
      <MaterialReactTable table={table} />
    </div>
  );
};

export default ProjectSchedule;
