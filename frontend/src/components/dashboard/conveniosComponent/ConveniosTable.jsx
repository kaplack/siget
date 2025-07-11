import React, { useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { Chip } from "@mui/material";
import {
  formatearFechaCorta,
  ordenarPorFirmaReciente,
} from "../../../utils/dateUtils";

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

function ConveniosTable({ agreements }) {
  // 📌 Memoize columns once — no need to recompute on re-renders
  const columns = useMemo(
    () => [
      {
        accessorKey: "alias",
        header: "Convenio",
        size: 50,
      },
      {
        accessorKey: "firmaConvenio",
        header: "Firma",
        size: 50,
        Cell: ({ cell }) => {
          const raw = cell.getValue();
          return raw ? formatearFechaCorta(raw) : "Sin fecha";
        },
      },
      {
        accessorKey: "estado",
        header: "Estado",
        size: 50,
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
    ],
    []
  );

  // 📌 Memoize data to ensure new reference on updates
  const rowOrder = useMemo(() => {
    if (!agreements) return [];
    return ordenarPorFirmaReciente([...agreements]); // <-- clave: copia nueva
  }, [agreements]);

  return (
    <MaterialReactTable
      columns={columns}
      data={rowOrder}
      enableSorting={false}
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
      initialState={{ pagination: { pageSize: 5 } }}
      renderTopToolbarCustomActions={() => (
        <h4 style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
          Convenios en proceso
        </h4>
      )}
      enableDensityToggle={false}
      enableColumnActions={false}
      enableColumnFilters={false}
      enableFullScreenToggle={false}
      enableGlobalFilter={false}
      enableHiding={false}
    />
  );
}

export default ConveniosTable;
