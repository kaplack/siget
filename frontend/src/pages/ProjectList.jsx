import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserProjects } from "../features/projects/projectSlice";
import { MaterialReactTable } from "material-react-table";
import { Chip, Button, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

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
    // {
    //   accessorKey: "departamento",
    //   header: "Departamento",
    // },
    // {
    //   accessorKey: "provincia",
    //   header: "Provincia",
    // },
    // {
    //   accessorKey: "distrito",
    //   header: "Distrito",
    // },
    // {
    //   accessorKey: "montoInversion",
    //   header: "Inversión (S/.)",
    // },
    // {
    //   accessorKey: "numeroBeneficiarios",
    //   header: "N° Beneficiarios",
    // },
    {
      accessorKey: "servicioPriorizado",
      header: "Servicio Priorizado",
    },
    {
      accessorKey: "actions",
      header: "Acciones",
      enableSorting: false,
      enableColumnFilter: false,
      Cell: ({ row }) => {
        const id = row.original.id;

        return (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`${id}/base-line`)}
            >
              Línea Base
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`${id}/tracking`)}
            >
              Seguimiento
            </Button>
          </div>
        );
      },
    },
  ];

  const estadoLabels = {
    borrador: "Borrador",
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

      <MaterialReactTable
        columns={columns}
        data={projects}
        enableColumnOrdering
        enableRowNumbers
        initialState={{
          pagination: { pageSize: 10, pageIndex: 0 },
        }}
      />
    </div>
  );
};

export default ProjectList;
