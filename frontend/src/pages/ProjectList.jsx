import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProjects } from "../features/projects/projectSlice";
import { MaterialReactTable } from "material-react-table";
import { Chip, Button, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
} from "material-react-table";
import { BsArrowsCollapse } from "react-icons/bs";
import { FaCalendarCheck } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

const ProjectList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { projects, isLoading, isError, message } = useSelector(
    (state) => state.project
  );

  useEffect(() => {
    dispatch(getUserProjects());
  }, [dispatch]);

  if (isLoading) return <CircularProgress />;
  if (isError) return <p>Error: {message}</p>;

  if (!projects || projects.length === 0) {
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Lista de Proyectos
        </Typography>
        <Typography variant="body1">No hay proyectos registrados.</Typography>
      </div>
    );
  }

  const columns = [
    {
      accessorKey: "nombreConvenio",
      header: "Nombre del Convenio",
    },
    {
      accessorKey: "nombreIdeaProyecto",
      header: "Nombre del Proyecto",
    },
    {
      accessorKey: "estado",
      header: "Estado del proyecto",
      Cell: ({ cell }) => {
        const estado = cell.getValue();
        return (
          <Chip
            label={estadoLabels[estado] || "Desconocido"}
            color={estadoColors[estado] || "default"}
            size="medium"
          />
        );
      },
    },

    {
      accessorKey: "actions",
      header: "Acciones",
      enableSorting: false,
      enableColumnFilter: false,
      minSize: 200,
      Cell: ({ row }) => {
        const id = row.original.id;

        return (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/app/project/edit/${id}`)}
              style={{ display: "flex", alignItems: "center" }}
            >
              <FaEdit
                size={18}
                style={
                  window.innerWidth >= 768
                    ? { marginRight: ".3rem" }
                    : undefined
                }
              />
              <span className="d-none d-md-inline">Proyecto</span>
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`${id}/base-line`)}
              style={{ display: "flex", alignItems: "center" }}
            >
              <BsArrowsCollapse
                size={18}
                style={
                  window.innerWidth >= 768
                    ? { marginRight: ".3rem" }
                    : undefined
                }
              />
              <span className="d-none d-md-inline">Línea Base</span>
            </Button>
            {row.original.estado !== "borrador" && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`${id}/tracking`)}
                style={{ display: "flex", alignItems: "center" }}
              >
                <FaCalendarCheck
                  style={
                    window.innerWidth >= 768
                      ? { marginRight: ".3rem" }
                      : undefined
                  }
                />
                <span className="d-none d-md-inline">Seguimiento</span>
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const estadoLabels = {
    borrador: "Planificación",
    linea_base: "Línea Base",
    ejecucion: "En Ejecución",
    finalizado: "Finalizado",
    cancelado: "Cancelado",
  };

  const estadoColors = {
    borrador: "default",
    linea_base: "info",
    ejecucion: "warning",
    finalizado: "success",
    cancelado: "error",
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Lista de Proyectos
      </Typography>
      <div style={{ overflow: "auto", marginBottom: "80px" }}>
        <div style={{ minWidth: "700px" }}>
          <MaterialReactTable
            columns={columns}
            data={projects}
            enableSorting={false}
            enableColumnActions={false}
            enableRowNumbers
            initialState={{
              pagination: { pageSize: 20, pageIndex: 0 },
              //density: "compact",
            }}
            renderToolbarInternalActions={({ table }) => (
              <>
                <MRT_ShowHideColumnsButton table={table} />
                <MRT_ToggleDensePaddingButton table={table} />
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
