// Programacion.jsx con EDT dinámico y preparación para drag and drop
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { buildTree } from "../utils/buildTree";
import { Button } from "@mui/material";

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

const ProjectSchedule = () => {
  const [data, setData] = useState([]);
  const dataRef = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();
  //console.log("Project ID:", projectId);

  const rawActivities = useSelector((state) => state.activities.activities);
  const currentProject = useSelector((state) => state.project.project);

  // Solo al montar: carga inicial de proyecto y actividades de seguimiento
  useEffect(() => {
    if (!projectId) return;

    dispatch(getProject(projectId));
    dispatch(getActivitiesByProject({ projectId, tipoVersion: "seguimiento" }));
  }, []);

  // Cada vez que cambian las actividades, reconstruye el árbol y aplica cambios locales pendientes
  useEffect(() => {
    if (!rawActivities || rawActivities.length === 0) return;

    const treeData = actualizarArbolConEDT(rawActivities);

    const aplicarCambiosLocales = (nodos) =>
      nodos.map((nodo) => {
        const cambios = unsavedChangesRef.current[nodo.id];
        const actualizado = cambios ? { ...nodo, ...cambios } : nodo;

        if (nodo.children?.length > 0) {
          return {
            ...actualizado,
            children: aplicarCambiosLocales(nodo.children),
          };
        }

        return actualizado;
      });

    const treeConCambios = aplicarCambiosLocales(treeData);
    setData(treeConCambios);
    dataRef.current = treeConCambios; // 👈 sincroniza ref
  }, [rawActivities]);

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

  const camposPermitidosSeguimiento = [
    "plazo",
    "fechaInicio",
    "fechaFin",
    "avance",
    "sustento",
  ];

  // Recursively calculate progress for a node using weighted average
  const calcularAvanceRecursivo = (nodo) => {
    if (!nodo.children || nodo.children.length === 0) {
      return nodo.avance || 0;
    }

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

  // Calculates total duration from leaf nodes only
  // Calculates total plazo from true leaves (no children)
  const calcularPlazoSeguimientoSoloHojas = (nodos) => {
    const hojas = [];

    const buscarHojas = (nodo) => {
      if (!nodo.children || nodo.children.length === 0) {
        if (nodo.tipo === "seguimiento" && nodo.plazo > 0) {
          hojas.push(nodo);
        }
      } else {
        nodo.children.forEach(buscarHojas);
      }
    };

    nodos.forEach(buscarHojas);
    return hojas.reduce((sum, h) => sum + h.plazo, 0);
  };

  const actualizarArbolConEDT = (listaPlana) => {
    const tree = buildTree(listaPlana);
    generarEDTs(tree);
    recalcularFechasPadres(tree); // actualiza fechas

    // 1. Calcular avance recursivo en cada raíz
    tree.forEach(calcularAvanceRecursivo);

    // 2. Calcular suma de plazos de hojas de seguimiento
    const hojas = flattenTree(tree).filter(
      (n) =>
        (!n.children || n.children.length === 0) &&
        n.tipo === "seguimiento" &&
        n.plazo > 0
    );
    const totalPlazo = calcularPlazoSeguimientoSoloHojas(tree);

    // 3. Calcular avance total del proyecto
    const avanceProyecto = calcularAvanceRecursivo({ children: tree });

    // 4. Actualizar proyecto con los nuevos valores
    dispatch(
      updateProject({
        id: projectId,
        updatedData: {
          avance: avanceProyecto,
          plazoSeguimiento: totalPlazo,
        },
      })
    );
    console.log("✔ Proyecto actualizado:", {
      id: projectId,
      avance: avanceProyecto,
      plazoSeguimiento: totalPlazo,
    });

    return tree;
  };

  const unsavedChangesRef = useRef({});
  const saveTimeoutsRef = useRef({});

  // Warn user before leaving the page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(unsavedChangesRef.current).length > 0) {
        e.preventDefault();
        e.returnValue =
          "Estás a punto de salir del navegador. Podrías perder información no guardada.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Manual save of all pending changes
  const handleGuardarTodo = () => {
    Object.entries(unsavedChangesRef.current).forEach(([rowId, data]) => {
      dispatch(addTrackingVersion({ activityId: rowId, versionData: data }))
        .unwrap()
        .then(() => {
          dispatch(
            getActivitiesByProject({ projectId, tipoVersion: "seguimiento" })
          );
        })
        .catch((err) => {
          alert(err.message || `No se pudo guardar la actividad ID ${rowId}`);
        });
      clearTimeout(saveTimeoutsRef.current[rowId]);
      delete unsavedChangesRef.current[rowId];
      delete saveTimeoutsRef.current[rowId];
    });
  };

  // Updated handleSaveCell with autosave logic per row
  const handleSaveCell = ({ cell, row, value }) => {
    const columnId = cell.column.id;
    const tipo = row.original.tipo;
    const rowId = row.original.id;

    const camposPermitidos = [
      "plazo",
      "fechaInicio",
      "fechaFin",
      "avance",
      "sustento",
    ];

    // ⛔ Solo permitir edición de campos permitidos
    if (tipo === "seguimiento" && !camposPermitidos.includes(columnId)) {
      alert(
        "Este campo no puede ser editado en seguimiento. Solo: plazo, fechas, avance, sustento."
      );
      return;
    }

    // 🧮 Validación de avance
    if (columnId === "avance") {
      const parsed = parseInt(value);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        alert("El avance debe ser un número entre 0 y 100.");
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
    let entrada = { ...row.original, [columnId]: value };
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
    const updatedTree = updateRow(dataRef.current);
    //console.log("🔎 Árbol actualizado antes de flatten:", updatedTree);
    const flattened = flattenTree(updatedTree);
    //console.log("📉 Lista plana:", flattened);
    const newTree = actualizarArbolConEDT(flattened);
    //console.log("🌳 Árbol final para setData:", newTree);
    setData(newTree);

    // 💾 Guardar en buffer
    if (!unsavedChangesRef.current[rowId]) {
      unsavedChangesRef.current[rowId] = {};
    }

    if (esFecha) {
      unsavedChangesRef.current[rowId] = {
        ...unsavedChangesRef.current[rowId],
        fechaInicio: entrada.fechaInicio,
        fechaFin: entrada.fechaFin,
        plazo: entrada.plazo,
      };
    } else {
      unsavedChangesRef.current[rowId][columnId] = value;
    }

    // 🕓 Reiniciar timeout de autosave
    if (saveTimeoutsRef.current[rowId]) {
      clearTimeout(saveTimeoutsRef.current[rowId]);
    }

    saveTimeoutsRef.current[rowId] = setTimeout(() => {
      const cambios = unsavedChangesRef.current[rowId];
      const originales = row.original;

      const hayCambios = Object.entries(cambios).some(
        ([clave, nuevoValor]) => nuevoValor !== originales[clave]
      );

      if (hayCambios) {
        dispatch(
          addTrackingVersion({ activityId: rowId, versionData: cambios })
        )
          .unwrap()
          .then(() => {
            dispatch(
              getActivitiesByProject({ projectId, tipoVersion: "seguimiento" })
            );
          })
          .catch((err) => {
            alert(err.message || "No se pudo actualizar la actividad.");
          });
      }

      delete unsavedChangesRef.current[rowId];
      delete saveTimeoutsRef.current[rowId];
    }, 30 * 1000); // 30 segundos por ahora
  };

  // 5 minutes 5 * 60 * 1000
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
    [currentProject]
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableStickyHeader: true,
    enableEditing: true,
    editDisplayMode: "cell",
    enableExpanding: true,
    getSubRows: (row) => row.children,
    enableSorting: false,
    enableColumnActions: false,
    //enableRowActions: true,
    positionActionsColumn: "last",
    displayColumnDefOptions: { "mrt-row-actions": { enableEditing: false } },
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
      density: "compact",
      pagination: { pageSize: 100 },
      expanded: true, // Expande todas las filas por defecto
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
      //console.log("🔍 row.original:", row.original.tipo);
      return {
        sx:
          row.original.level === 1
            ? {
                backgroundColor: "#f0f4ff",
                fontWeight: "bold",
                fontSize: "1rem",
                color: "#1a237e",
              }
            : {},
      };
    },
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    if (currentProject.estado !== "borrador") {
      toast.warning(
        "No se puede reorganizar actividades en el seguimiento de actividades."
      );
      return;
    }

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
        if (ref && ref.orden !== index + 1) {
          ref.orden = index + 1;

          // ☁️ Actualizar orden en backend
          dispatch(
            updateDraftActivity({
              activityId: ref.id,
              data: { orden: ref.orden },
            })
          ).catch((err) => {
            console.error(`❌ Error updating orden for id ${ref.id}:`, err);
          });
        }
      });
    } else {
      // 🔽 Move as child
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

      const newParentId = targetItem.id;
      const maxOrden = Math.max(
        0,
        ...updated
          .filter((i) => i.parentId === newParentId)
          .map((i) => i.orden ?? 0)
      );

      updated.forEach((item) => {
        if (item.id === draggedItem.id) {
          const changedParent = item.parentId !== newParentId;
          const changedOrden = item.orden !== maxOrden + 1;

          item.parentId = newParentId;
          item.orden = maxOrden + 1;

          if (changedParent || changedOrden) {
            dispatch(
              updateDraftActivity({
                activityId: item.id,
                data: {
                  parentId: newParentId,
                  orden: item.orden,
                },
              })
            ).catch((err) => {
              console.error("❌ Error updating parentId/orden:", err);
            });
          }
        }
      });
    }

    const newTree = actualizarArbolConEDT(updated);
    setData(newTree);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Seguimiento de Actividades</h2>
      <h4>{currentProject?.nombreConvenio}</h4>
      <p>CUI: {currentProject?.cui}</p>

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

export default ProjectSchedule;
