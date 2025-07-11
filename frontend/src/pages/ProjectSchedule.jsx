// ProjectSchedule.jsx  con EDT dinámico y preparación para drag and drop
import { useState, useEffect, useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import { Button } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import {
  getActivitiesByProject,
  addTrackingVersion,
} from "../features/activities/activitySlice";
import { getProject, updateProject } from "../features/projects/projectSlice";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaRegSave } from "react-icons/fa";

import {
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
} from "material-react-table";
import { calendarioConfig } from "../utils/dateUtils";
import { generarEDTs } from "../utils/activityUtils";
import { recalcularFechasPadres } from "../utils/workingDay";
import {
  calcularAvanceRecursivo,
  calcularPlazoHojas,
} from "../utils/activityUtils";
import { useProjectTree } from "../hooks/projectTracking/useProjectTree";
import { useLocalTree } from "../hooks/projectTracking/useLocalTree";
import { useSaveCell } from "../hooks/projectTracking/useSaveCell";
import { getColumns } from "../utils/getColumns";
// Manual save of all pending changes
import { buildTree } from "../utils/buildTree";

const ProjectSchedule = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const rawActivities = useSelector((state) => state.activities.activities);
  //console.log("RAW_ACTIVITIES");
  //console.table(rawActivities);
  const currentProject = useSelector((state) => state.project.project);

  const [localChanges, setLocalChanges] = useState({});
  const [expanded, setExpanded] = useState({});

  // Solo al montar: carga inicial de proyecto y actividades de seguimiento
  useEffect(() => {
    if (!projectId) return;

    dispatch(getProject(projectId));
    dispatch(getActivitiesByProject({ projectId, tipoVersion: "seguimiento" }));
  }, [projectId]);

  // Build base tree and merge edits
  const baseTree = useProjectTree(rawActivities);
  const dataToRender = useLocalTree(baseTree, localChanges);

  // Cell-saving logic encapsulated in a custom hook
  const handleSaveCell = useSaveCell({
    data: baseTree,
    setLocalChanges,
    calendarioConfig,
  });

  // Columns factory
  const columns = useMemo(() => getColumns(handleSaveCell), [handleSaveCell]);

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

  /**
   * Save all pending tracking changes, then recompute and persist
   * the project's real progress and total tracking span.
   */
  const handleGuardarTodo = async () => {
    // Prevent save if the signature date is missing
    if (!currentProject?.firmaConvenio) {
      toast.warning(
        "No se puede guardar el seguimiento. Debe registrar primero la fecha de firma del convenio."
      );
      // Discard local edits and reload activities
      setLocalChanges({});
      try {
        await dispatch(
          getActivitiesByProject({ projectId, tipoVersion: "seguimiento" })
        ).unwrap();
      } catch (err) {
        console.error(err);
        toast.error("Error al recargar actividades.");
      }
      return;
    }

    try {
      // 1. Persist all local changes concurrently
      await Promise.allSettled(
        Object.entries(localChanges).map(([activityId, changes]) =>
          dispatch(
            addTrackingVersion({ activityId, versionData: changes })
          ).unwrap()
        )
      );

      // 2. Reload activities from backend (seguimiento version)
      const action = await dispatch(
        getActivitiesByProject({ projectId, tipoVersion: "seguimiento" })
      ).unwrap();
      // assuming payload is in action.activities; adjust if different
      //console.log(action);
      const activities = action.activities || action;

      // 3. Build a tree structure from the flat list
      const activityTree = buildTree(activities);

      // 1) Genera tus EDTs si los necesitas
      generarEDTs(activityTree);
      // 2) Recalcula fechas y plazos de TODOS los padres
      recalcularFechasPadres(activityTree);

      //console.log(activityTree);
      // 4. Recalculate project-level metrics
      const projectProgress = calcularAvanceRecursivo({
        children: activityTree,
      });
      const trackingSpan = calcularPlazoHojas(activityTree);

      //console.log(projectProgress, " ", trackingSpan);
      // 5. Persist updated metrics in Project
      await dispatch(
        updateProject({
          id: projectId,
          updatedData: {
            avance: projectProgress,
            plazoSeguimiento: trackingSpan,
          },
        })
      ).unwrap();

      // 6. Clear local edits and show success
      setLocalChanges({});
      toast.success("Guardado exitoso y métricas de proyecto actualizadas.");
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar el seguimiento o actualizar el proyecto.");
    }
  };

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
