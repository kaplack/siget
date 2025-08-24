import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserProjects,
  annulUserProject,
  getAllProjects,
  assignResponsable,
} from "../features/projects/projectSlice";
import { getUsers } from "../features/auth/authSlice";
import { MaterialReactTable } from "material-react-table";
import {
  Chip,
  Button,
  CircularProgress,
  Typography,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
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
  FaUserEdit,
} from "react-icons/fa";

const ProjectList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { projects, isLoading, isError, message } = useSelector(
    (state) => state.project
  );
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.auth || { users: [] });

  // English: local UI state for the assignment modal
  const [openAssign, setOpenAssign] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    if (user?.profile?.name === "admin") {
      dispatch(getAllProjects());
      dispatch(getUsers());
    } else {
      dispatch(getUserProjects());
      dispatch(getUsers());
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

  // English: refresh list depending on role
  const refreshProjects = () => {
    if (user?.profile?.name === "admin") {
      dispatch(getAllProjects());
    } else {
      dispatch(getUserProjects());
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await dispatch(annulUserProject(id)).unwrap(); // <- espera a que termine
        dispatch(getUserProjects()); // <- actualiza la lista completa
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  };

  // English: open modal and prefill with current responsible if exists
  const openAssignModal = (row) => {
    setSelectedProjectId(row.original.id);
    setSelectedUserId(row.original?.user?.id ?? "");
    setOpenAssign(true);
  };

  const onConfirmAssign = async () => {
    try {
      await dispatch(
        assignResponsable({
          projectId: selectedProjectId,
          userId: selectedUserId,
        })
      ).unwrap();
      setOpenAssign(false);
      refreshProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const canAssign = ["admin", "coordinador"].includes(user?.profile?.name);

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
      id: "responsable",
      header: "Responsable",
      // English: Provide a computed value so it can be sorted/filtered
      accessorFn: (row) =>
        `${row?.user?.name ?? ""} ${row?.user?.lastName ?? ""}`.trim(),
      size: 160,
      minSize: 120,
      maxSize: 250,
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
            {/* English: assign responsible */}
            {canAssign && (
              <Tooltip title="Asignar responsable">
                <IconButton size="small" onClick={() => openAssignModal(row)}>
                  <FaUserEdit size={18} />
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
      {/* English: Assign Responsible Modal */}
      <Dialog
        open={openAssign}
        onClose={() => setOpenAssign(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Asignar responsable</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Selecciona un usuario
            </MenuItem>
            {users?.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name} {u.lastName} — {u?.profile?.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssign(false)}>Cancelar</Button>
          <Button
            onClick={onConfirmAssign}
            variant="contained"
            disabled={!selectedUserId}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectList;
