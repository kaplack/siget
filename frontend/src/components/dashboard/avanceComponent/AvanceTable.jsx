import React, { useMemo, useState, useEffect } from "react";
import { MaterialReactTable } from "material-react-table";
import { Button, Box } from "@mui/material";

function AvanceTable({ data }) {
  const [filtroDireccion, setFiltroDireccion] = useState("TODOS");
  const [dataTabla, setDataTabla] = useState([]);

  // Obtener direcciones únicas presentes en los datos
  const direccionesDisponibles = useMemo(() => {
    const unicas = new Set(data.map((d) => d.direccion));
    return ["TODOS", ...Array.from(unicas)];
  }, [data]);

  // Solo setear datos una vez si vienen del padre
  useEffect(() => {
    if (data?.length > 0 && dataTabla.length === 0) {
      setDataTabla(data);
    }
  }, [data, dataTabla]);

  const datosFiltrados = useMemo(() => {
    return dataTabla.filter((d) =>
      filtroDireccion === "TODOS" ? true : d.direccion === filtroDireccion
    );
  }, [dataTabla, filtroDireccion]);

  //const centeredHeader = { sx: { textAlign: "center" } };

  const columns = useMemo(
    () => [
      {
        accessorKey: "direccion",
        header: "Dirección",
        size: 50,
        muiTableHeadCellProps: {
          sx: { display: { xs: "none", sm: "none", md: "table-cell" } },
        },
        muiTableBodyCellProps: {
          sx: { display: { xs: "none", sm: "none", md: "table-cell" } },
        },
      },
      {
        accessorKey: "alias",
        header: "Proyecto",
        size: 50,
      },

      {
        accessorKey: "avancePlanificado",
        header: "Plan. (%)",
        size: 50,
        Cell: ({ cell }) => `${cell.getValue() ?? 0}%`,
        muiTableHeadCellProps: {
          sx: { display: { xs: "none", sm: "none", md: "table-cell" } },
        },
        muiTableBodyCellProps: {
          sx: { display: { xs: "none", sm: "none", md: "table-cell" } },
        },
      },
      {
        accessorKey: "avanceReal",
        header: "Real (%)",
        size: 50,
        Cell: ({ cell }) => `${cell.getValue() ?? 0}%`,
        muiTableHeadCellProps: {
          sx: { display: { xs: "none", sm: "none", md: "table-cell" } },
        },
        muiTableBodyCellProps: {
          sx: { display: { xs: "none", sm: "none", md: "table-cell" } },
        },
      },
      {
        accessorKey: "desviacion",
        header: "Desv.(%)",
        size: 50,
        Cell: ({ cell }) => `${cell.getValue() ?? 0}%`,
      },
      {
        accessorKey: "semaforo",
        header: "Semáforo",
        size: 25,
        //muiTableHeadCellProps: centeredHeader,
        Cell: ({ cell }) => {
          const color =
            cell.getValue() === "verde"
              ? "#4caf50"
              : cell.getValue() === "amarillo"
              ? "#ff9800"
              : "#f44336";
          return (
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: color,
                margin: "auto",
              }}
            />
          );
        },
      },
      // {
      //   accessorKey: "estado",
      //   header: "Estado",
      //   size: 100,
      // },
    ],
    []
  );

  return (
    <div>
      {/* <div style={{ marginBottom: "1rem" }}>
        {direccionesDisponibles.map((dir) => (
          <Button
            key={dir}
            variant={filtroDireccion === dir ? "contained" : "outlined"}
            onClick={() => setFiltroDireccion(dir)}
            style={{ marginRight: 8 }}
          >
            {dir}
          </Button>
        ))}
      </div> */}

      <MaterialReactTable
        columns={columns}
        data={datosFiltrados}
        enableRowNumbers
        displayColumnDefOptions={{
          "mrt-row-numbers": {
            muiTableHeadCellProps: {
              sx: { display: { xs: "none", sm: "none", md: "table-cell" } },
            },
            muiTableBodyCellProps: {
              sx: { display: { xs: "none", sm: "none", md: "table-cell" } },
            },
          },
        }}
        enableDensityToggle={false}
        enableColumnActions={false}
        enableColumnFilters={false}
        enableFullScreenToggle={false}
        enableGlobalFilter={false}
        enableHiding={false}
        initialState={{ pagination: { pageSize: 10 } }}
        renderTopToolbarCustomActions={({ table }) => (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <h4 style={{ margin: 0 }}>Convenios en Ejecución</h4>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {direccionesDisponibles.map((dir) => (
                <Button
                  key={dir}
                  variant={filtroDireccion === dir ? "contained" : "outlined"}
                  onClick={() => setFiltroDireccion(dir)}
                >
                  {dir}
                </Button>
              ))}
            </div>
          </div>
        )}
      />
    </div>
  );
}

export default AvanceTable;
