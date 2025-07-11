// Programacion.jsx con EDT dinámico y preparación para drag and drop
import React, { useState, useEffect } from "react";
import {
  MaterialReactTable,
  MRT_ActionMenuItem,
  useMaterialReactTable,
} from "material-react-table";
import { buildTree } from "../utils/buildTree";
import { Button, Divider, CircularProgress } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";

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
  createActivity,
  updateDraftActivity,
  deleteDraftActivity,
  setBaselineForProject,
  resetActivityState,
  importarActividadesExcel,
  deleteAllActivitiesByProject,
} from "../features/activities/activitySlice";
import { getProject } from "../features/projects/projectSlice";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

const ProjectBaseLine = () => {
  const [data, setData] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();

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
    generarEDTs(tree);
    recalcularFechasPadres(tree); // <-- esta línea nueva
    return tree;
  };

  useEffect(() => {
    if (!projectId) return; // 👈 asegura que projectId esté definido
    setData([]);
    dispatch(resetActivityState());
    dispatch(getProject(projectId));
    dispatch(getActivitiesByProject({ projectId, tipoVersion: "base" }));
  }, [dispatch, projectId]);

  const { isLoading } = useSelector((state) => state.activities);
  const rawActivities = useSelector((state) => state.activities.activities);
  const currentProject = useSelector((state) => state.project.project);

  //console.log(currentProject);

  useEffect(() => {
    //console.log("🔄 rawActivities actualizadas:", rawActivities);
    const treeData = rawActivities.length
      ? actualizarArbolConEDT(rawActivities)
      : [];
    setData(treeData);
  }, [rawActivities]);

  const handleSaveCell = ({ cell, row, value }) => {
    if (currentProject.estado !== "borrador") {
      toast.warning("⚠️ No se puede editar una línea base ya establecida.");
      return;
    }

    const columnId = cell.column.id;
    const original = row.original;

    // Base updated entry
    let entrada = {
      ...original,
      [columnId]: value,
    };

    // Detect if it's a scheduling field
    const esCampoFecha =
      columnId === "fechaInicio" ||
      columnId === "fechaFin" ||
      columnId === "plazo";

    // Apply working day logic if needed
    if (esCampoFecha) {
      const campos = calcularTerceraVariable(
        {
          fechaInicio: entrada.fechaInicio,
          fechaFin: entrada.fechaFin,
          plazo: entrada.plazo,
        },
        [], // optional holidays
        columnId
      );
      entrada = { ...entrada, ...campos };
    }

    // Local tree update
    const updateRow = (rows) =>
      rows.map((item) => {
        if (item.id === original.id) {
          return entrada;
        }
        if (item.children?.length > 0) {
          return { ...item, children: updateRow(item.children) };
        }
        return item;
      });

    const updatedTree = updateRow(data);
    const newTree = actualizarArbolConEDT(flattenTree(updatedTree));
    setData(newTree);

    // Data to persist
    const datosAGuardar = esCampoFecha
      ? {
          fechaInicio: entrada.fechaInicio,
          fechaFin: entrada.fechaFin,
          plazo: entrada.plazo,
        }
      : { [columnId]: value };

    // Dispatch DB update
    dispatch(
      updateDraftActivity({
        activityId: original.id,
        data: datosAGuardar,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(getActivitiesByProject({ projectId, tipoVersion: "base" }));
      })
      .catch((err) => {
        alert(err.message || "❌ No se pudo actualizar la versión base.");
      });
  };

  const handleAddActivity = async (parentId = 0) => {
    if (currentProject.estado !== "borrador") {
      toast.warning(
        "⚠️ No se puede agregar actividades una vez establecida la línea base."
      );
      return;
    }

    const flatData = flattenTree(data);

    // Obtener el mayor orden de los hermanos
    const ordenMax = Math.max(
      0,
      ...flatData
        .filter((item) => item.parentId === parentId)
        .map((item) => item.orden ?? 0)
    );

    // Preparar nueva versión
    const version = {
      nombre: "Nueva Actividad",
      parentId,
      orden: ordenMax + 1,
      fechaInicio: null,
      fechaFin: null,
      responsable: "",
      avance: 0,
      plazo: 0,
      sustento: "",
    };

    // Enviar al backend
    const resultAction = await dispatch(createActivity({ projectId, version }));

    // Verifica si fue exitoso y actualiza el árbol
    if (createActivity.fulfilled.match(resultAction)) {
      const { activity, version } = resultAction.payload;

      const newItem = {
        id: activity.id,
        parentId: version.parentId,
        nombre: version.nombre,
        fechaInicio: version.fechaInicio,
        fechaFin: version.fechaFin,
        responsable: version.responsable,
        avance: version.avance,
        plazo: version.plazo,
        sustento: version.sustento,
        orden: version.orden,
      };

      const updatedFlatData = [...flatData, newItem];
      const newTree = actualizarArbolConEDT(updatedFlatData);
      setData(newTree);
    } else {
      console.error("Error creating activity:", resultAction.payload);
    }
  };

  const handleDelete = async (id) => {
    if (currentProject.estado !== "borrador") {
      toast.warning(
        "⚠️ No se puede eliminar actividades una vez establecida la línea base."
      );
      return;
    }

    const flatData = flattenTree(data);

    // Get all descendant IDs recursively
    const collectDescendants = (parentId) => {
      const children = flatData.filter((item) => item.parentId === parentId);
      return children.flatMap((child) => [
        child.id,
        ...collectDescendants(child.id),
      ]);
    };

    const idsToDelete = [id, ...collectDescendants(id)];

    // Eliminate all from backend first
    for (const actId of idsToDelete) {
      try {
        await dispatch(deleteDraftActivity(actId)).unwrap();
      } catch (err) {
        alert(`❌ No se pudo eliminar la actividad ID ${actId}: ${err}`);
        return; // stop here if any deletion fails
      }
    }

    // Then remove from frontend state
    const filtered = flatData.filter((item) => !idsToDelete.includes(item.id));
    const newTree = actualizarArbolConEDT(filtered);
    setData(newTree);
  };

  // Importar actividades desde Excel
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (
      !window.confirm("¿Deseas importar actividades desde este archivo Excel?")
    )
      return;

    dispatch(importarActividadesExcel({ projectId, file }))
      .unwrap()
      .then((res) => {
        toast.success(res.message);
        dispatch(getActivitiesByProject({ projectId, tipoVersion: "base" }));
      })
      .catch((err) => {
        toast.error("❌ " + err);
      });
  };

  const handleEliminarTodas = () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar todas las actividades del proyecto?"
      )
    )
      return;

    dispatch(deleteAllActivitiesByProject(projectId))
      .unwrap()
      .then((res) => {
        toast.success(res.message);
        dispatch(getActivitiesByProject({ projectId, tipoVersion: "base" }));
      })
      .catch((err) => {
        toast.error(err);
      });
  };

  const columns = [
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
      size: 30,
      enableEditing: false,
    },
    {
      accessorKey: "nombre",
      header: "Actividad",
      enableEditing: currentProject?.estado === "borrador",

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
      enableEditing: currentProject.estado === "borrador",
      muiTableBodyCellEditTextFieldProps: { type: "number" },
      size: 40,

      muiEditTextFieldProps: ({ cell, row, table }) => ({
        onBlur: (event) => {
          const value = event.target.value;
          // Solo guardar si hay cambio real
          if (Number(value) !== Number(row.original[cell.column.id])) {
            handleSaveCell({ cell, row, value });
          }
        },
      }),
    },
    {
      accessorKey: "fechaInicio",
      header: "Fecha Inicio",
      enableEditing: currentProject.estado === "borrador",
      size: 80,
      Cell: ({ cell }) => formatearFechaVisual(cell.getValue()),
      muiEditTextFieldProps: ({ cell, row, table }) => ({
        type: "date",
        defaultValue: cell.getValue(),
        onBlur: (event) => {
          const value = event.target.value;

          if (!value || value === null) {
            console.log("⛔ Fecha vacía o null, no se guarda");
            return;
          }

          if (value !== row.original[cell.column.id]) {
            console.log("💾 Guardando fechaInicio:", value);
            handleSaveCell({ cell, row, value });
          }
        },
      }),
    },

    {
      accessorKey: "fechaFin",
      header: "Fecha Fin",
      enableEditing: currentProject.estado === "borrador",
      size: 80,
      Cell: ({ cell }) => formatearFechaVisual(cell.getValue()),

      muiEditTextFieldProps: ({ cell, row, table }) => ({
        type: "date",
        defaultValue: cell.getValue(),
        onBlur: (event) => {
          const value = event.target.value;

          if (!value || value === null) {
            console.log("⛔ Fecha vacía o null, no se guarda");
            return;
          }

          if (value !== row.original[cell.column.id]) {
            console.log("💾 Guardando fechaInicio:", value);
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
      enableEditing: currentProject.estado === "borrador",
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
  ];
  // [currentProject]
  //);

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
    //enablePagination: false,
    //enableRowActions: true,
    positionActionsColumn: "last",
    // displayColumnDefOptions: { "mrt-row-actions": { enableEditing: false } },
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
      //density: "compact",
      pagination: { pageSize: 250 },
      expanded: true, // expand all rows by default
    },
    renderToolbarInternalActions: ({ table }) => (
      <>
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
      </>
    ),
    renderTopToolbarCustomActions: () =>
      currentProject.estado !== "borrador" ? (
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/app/project-list/${projectId}/tracking`)}
          >
            Ir a Seguimiento
          </Button>
        </div>
      ) : (
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="excel-upload">
            {/* Disable file input while loading */}
            <input
              type="file"
              accept=".xlsx,.xls"
              id="excel-upload"
              hidden
              disabled={isLoading}
              onChange={handleImportExcel}
            />
            {/* Show spinner inside the button when loading */}
            <Button
              variant="outlined"
              color="primary"
              component="span"
              startIcon={
                isLoading ? <CircularProgress size={20} /> : <UploadFileIcon />
              }
              disabled={isLoading}
            >
              {isLoading ? "Importando..." : "Importar Excel"}
            </Button>
          </label>

          <Button
            variant="outlined"
            color="error"
            onClick={handleEliminarTodas}
            disabled={isLoading} // also disable delete-all while importing
            startIcon={<DeleteIcon />}
          >
            Actividades
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
        // Agregar actividad al mismo nivel con Ctrl+A
        if (event.key.toLowerCase() === "h" && event.ctrlKey) {
          const newParentId = row.original.parentId ?? 0;
          handleAddActivity(newParentId);
        }

        // Agregar subactividad con Ctrl+S
        if (event.key.toLowerCase() === "j" && event.ctrlKey) {
          handleAddActivity(row.original.id);
        }
      },
    }),

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
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    if (currentProject.estado !== "borrador") {
      toast.warning(
        "No se puede reorganizar actividades una vez establecida la línea base."
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
            )
              .unwrap()
              .catch((err) => {
                toast.error(
                  `❌ Error updating parentId/orden for id ${item.id}: ${err}`
                );
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
    <>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Linea Base del Convenio</h2>
        <h4>{currentProject?.alias}</h4>
        <p>
          {currentProject?.cui && `CUI: ${currentProject.cui} `}
          {currentProject?.ci && `CI: ${currentProject.ci}`}
        </p>
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
        {currentProject.estado === "borrador" && (
          <>
            <Button
              variant="contained"
              color="primary"
              disabled={isLoading}
              onClick={() => handleAddActivity(0)}
              sx={{ mb: 2 }}
              style={{ marginTop: "1rem" }}
            >
              + Agregar Actividad Principal
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              disabled={isLoading}
              onClick={() => {
                if (
                  window.confirm(
                    "¿Estás seguro de que deseas establecer la línea base?"
                  )
                ) {
                  dispatch(setBaselineForProject(projectId))
                    .unwrap()
                    .then((res) => {
                      alert(res.message);
                      navigate("/app/project-list");
                    })
                    .catch((err) => alert("Error: " + err));
                  console.log(
                    "Establecer línea base para el proyecto:",
                    projectId
                  );
                }
              }}
              style={{ marginLeft: "1rem" }}
            >
              Establecer Línea Base
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default ProjectBaseLine;
