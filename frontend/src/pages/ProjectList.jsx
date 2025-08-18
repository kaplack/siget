import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserProjects,
  deleteUserProject,
  getAllProjects,
} from "../features/projects/projectSlice";
import { MaterialReactTable } from "material-react-table";
import {
  Chip,
  Button,
  CircularProgress,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
} from "material-react-table";
import { BsArrowsCollapse } from "react-icons/bs";
import {
  FaCalendarCheck,
  FaEdit,
  FaRegTrashAlt,
  FaRegCheckCircle,
} from "react-icons/fa";

const ProjectList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { projects, isLoading, isError, message } = useSelector(
    (state) => state.project
  );
  const { user } = useSelector((state) => state.auth);
  console.log("User:", user);

  useEffect(() => {
    if (user?.profileId === "admin") {
      dispatch(getAllProjects());
    } else {
      dispatch(getUserProjects());
    }
  }, [dispatch, user]);

  if (isLoading)
    return (
      <>
        <div className="d-flex flex-column  vh-100 justify-content-center align-items-center">
          <p>Cargando convenios</p>
          <br />
          <CircularProgress />
        </div>
      </>
    );
  if (isError) return <p>Error: {message}</p>;

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await dispatch(deleteUserProject(id)).unwrap(); // <- espera a que termine
        dispatch(getUserProjects()); // <- actualiza la lista completa
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  };

  const columns = [
    {
      accessorKey: "alias",
      header: "Nombre corto",
      size: 50,
    },
    {
      accessorKey: "nombreConvenio",
      header: "Nombre del Convenio",
      size: 350,
    },

    {
      accessorKey: "estado",
      header: "Estado del convenio",
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
      minSize: 360,
      Cell: ({ row }) => {
        const id = row.original.id;

        return (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Tooltip title="Editar Convenio">
              <IconButton
                size="small"
                onClick={() => navigate(`/app/project/edit/${id}`)}
              >
                <FaEdit size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Actos previos">
              <IconButton
                size="small"
                onClick={() => navigate(`${id}/previous`)}
              >
                <FaRegCheckCircle size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Línea Base">
              <IconButton
                size="small"
                onClick={() => navigate(`${id}/base-line`)}
              >
                <BsArrowsCollapse size={18} />
              </IconButton>
            </Tooltip>
            {row.original.estado !== "borrador" && (
              <Tooltip title="Seguimiento del Convenio">
                <IconButton
                  size="small"
                  onClick={() => navigate(`${id}/tracking`)}
                >
                  <FaCalendarCheck />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Eliminar Convenio">
              <IconButton
                size="small"
                onClick={() => handleDelete(id)}
                color="error"
              >
                <FaRegTrashAlt size={16} />
              </IconButton>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const estadoLabels = {
    borrador: "Programación",
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
        Convenios Activos
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
