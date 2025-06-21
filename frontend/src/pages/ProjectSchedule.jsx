// Programacion.jsx con EDT dinámico y preparación para drag and drop
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MaterialReactTable,
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
import { formatearFechaVisual } from "../utils/formatDate";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  getActivitiesByProject,
  createActivity,
  updateDraftActivity,
  deleteDraftActivity,
  resetActivityState,
  addTrackingVersion,
} from "../features/activities/activitySlice";
import { getProject } from "../features/projects/projectSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaRegSave } from "react-icons/fa";

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
  const dispatch = useDispatch();
  const { projectId } = useParams();
  //console.log("Project ID:", projectId);

  useEffect(() => {
    setData([]);
    dispatch(resetActivityState());
    dispatch(getProject(projectId)); // Cargar proyecto actual
    dispatch(getActivitiesByProject({ projectId, tipoVersion: "seguimiento" }));
  }, [dispatch, projectId]);

  const rawActivities = useSelector((state) => state.activities.activities);
  const currentProject = useSelector((state) => state.project.project);

  useEffect(() => {
    console.log("🔄 rawActivities actualizadas:", rawActivities);
    const treeData = rawActivities.length
      ? actualizarArbolConEDT(rawActivities)
      : [];
    setData(treeData);
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

  const actualizarArbolConEDT = (listaPlana) => {
    const tree = buildTree(listaPlana);
    generarEDTs(tree); // Mutación en sitio
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
      dispatch(updateDraftActivity({ activityId: rowId, data }))
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

    // Allow editing only for permitted fields in 'seguimiento' type
    if (
      tipo === "seguimiento" &&
      !camposPermitidosSeguimiento.includes(columnId)
    ) {
      alert(
        "Este campo no puede ser editado en seguimiento. Solo: plazo, fechas, avance, sustento."
      );
      return;
    }

    // Parse and validate 'avance'
    if (columnId === "avance") {
      const parsed = parseInt(value);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        alert("El avance debe ser un número entre 0 y 100.");
        return;
      }
      value = parsed;
    }

    // Validate start/end dates
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

    // Skip update if value hasn't changed
    if (row.original[columnId] === value) return;

    // Update local table state
    const updateRow = (rows) =>
      rows.map((item) =>
        item.id === rowId
          ? { ...item, [columnId]: value }
          : item.children?.length > 0
          ? { ...item, children: updateRow(item.children) }
          : item
      );
    const updatedTree = updateRow(data);
    const newTree = actualizarArbolConEDT(flattenTree(updatedTree));
    setData(newTree);

    // Store field change in unsavedChangesRef
    if (!unsavedChangesRef.current[rowId]) {
      unsavedChangesRef.current[rowId] = {};
    }
    unsavedChangesRef.current[rowId][columnId] = value;

    // Reset timeout if already running for this row
    if (saveTimeoutsRef.current[rowId]) {
      clearTimeout(saveTimeoutsRef.current[rowId]);
    }

    // Schedule auto-save after 5 minutes
    saveTimeoutsRef.current[rowId] = setTimeout(() => {
      const pendingData = unsavedChangesRef.current[rowId];
      const originalData = row.original;

      // Check for actual changes
      const hasRealChanges = Object.entries(pendingData).some(
        ([key, newValue]) => newValue !== originalData[key]
      );

      if (hasRealChanges) {
        dispatch(
          addTrackingVersion({ activityId: rowId, versionData: pendingData })
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
    }, 5 * 60 * 1000); // 5 minutes
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
            if (value !== row.original.nombre) {
              handleSaveCell({ cell, row, value });
            }
          },
        }),
      },
      {
        accessorKey: "plazo",
        header: "Plazo (días)",
        enableEditing: (row) => row.original.tipo === "seguimiento",
        muiTableBodyCellEditTextFieldProps: { type: "number" },
        size: 40,
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          onBlur: (event) => {
            const value = event.target.value;
            // Solo guardar si hay cambio real
            if (value !== row.original.nombre) {
              handleSaveCell({ cell, row, value });
            }
          },
        }),
      },
      {
        accessorKey: "fechaInicio",
        header: "Fecha Inicio",
        enableEditing: (row) => row.original.tipo === "seguimiento",
        size: 80,
        Cell: ({ cell }) => formatearFechaVisual(cell.getValue()),
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          onBlur: (event) => {
            const value = event.target.value;
            // Solo guardar si hay cambio real
            if (value !== row.original.nombre) {
              handleSaveCell({ cell, row, value });
            }
          },
        }),
        muiTableBodyCellEditProps: {
          renderEditCell: ({ cell, row, table }) => {
            console.log("🧪 DatePicker is rendering!");
            return (
              <DatePicker
                format="DD-MM-YYYY"
                value={cell.getValue() ? dayjs(cell.getValue()) : null}
                onChange={(newValue) => {
                  const iso = newValue?.format("YYYY-MM-DD");
                  table.setEditingCell(null); // exit edit mode
                  handleSaveCell({
                    cell,
                    row,
                    value: iso,
                  });
                }}
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            );
          },
        },
      },
      {
        accessorKey: "fechaFin",
        header: "Fecha Fin",
        enableEditing: (row) => row.original.tipo === "seguimiento",
        size: 80,
        Cell: ({ cell }) => formatearFechaVisual(cell.getValue()),
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          onBlur: (event) => {
            const value = event.target.value;
            // Solo guardar si hay cambio real
            if (value !== row.original.nombre) {
              handleSaveCell({ cell, row, value });
            }
          },
        }),
        muiTableBodyCellEditProps: {
          renderEditCell: ({ cell, row, table }) => (
            <DatePicker
              format="DD-MM-YYYY"
              value={cell.getValue() ? dayjs(cell.getValue()) : null}
              onChange={(newValue) => {
                const iso = newValue?.format("YYYY-MM-DD");
                table.setEditingCell(null);
                handleSaveCell({
                  cell,
                  row,
                  value: iso,
                });
              }}
              slotProps={{
                textField: { size: "small", fullWidth: true },
              }}
            />
          ),
        },
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
            if (value !== row.original.nombre) {
              handleSaveCell({ cell, row, value });
            }
          },
        }),
      },
      {
        accessorKey: "avance",
        header: "Avance (%)",
        muiTableBodyCellEditTextFieldProps: { type: "number" },
        enableEditing: (row) => row.original.tipo === "seguimiento",
        size: 80,
        muiEditTextFieldProps: ({ cell, row, table }) => ({
          onBlur: (event) => {
            const value = event.target.value;
            // Solo guardar si hay cambio real
            if (value !== row.original.nombre) {
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
            if (value !== row.original.nombre) {
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
    renderTopToolbarCustomActions: () => (
      <Button variant="contained" color="primary" onClick={handleGuardarTodo}>
        <FaRegSave size={23} />
      </Button>
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
