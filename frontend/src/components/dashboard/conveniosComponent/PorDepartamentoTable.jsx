// src/components/PorDepartamentoTable.jsx
import { useState, useMemo } from "react";
import {
  useTheme,
  useMediaQuery,
  Button,
  ButtonGroup,
  Box,
  Typography,
} from "@mui/material";
import { MaterialReactTable } from "material-react-table";

import { getDepartmentAgreeTypeCounts } from "../../../utils/dashboardUtil";

function PorDepartamentoTable({ agreements }) {
  // 1 Datos originales
  const rawData = useMemo(
    () => getDepartmentAgreeTypeCounts(agreements),
    [agreements]
  );

  // 2 Direcciones únicas + "Todos"
  const allDirecciones = useMemo(() => {
    const set = new Set(rawData.map((d) => d.direccion));
    return ["Todos", ...Array.from(set)];
  }, [rawData]);

  // 3 Dirección seleccionada
  const [selectedDir, setSelectedDir] = useState("Todos");

  // 4 Filtrar por dirección
  const filteredByDir = useMemo(() => {
    if (selectedDir === "Todos") return rawData;
    return rawData.filter((d) => d.direccion === selectedDir);
  }, [rawData, selectedDir]);

  // 5 Agrupar por departamento
  const tableData = useMemo(() => {
    const map = new Map();
    filteredByDir.forEach(({ departamento, colaboracion, delegacion }) => {
      if (!map.has(departamento)) {
        map.set(departamento, { departamento, colaboracion: 0, delegacion: 0 });
      }
      const item = map.get(departamento);
      item.colaboracion += colaboracion;
      item.delegacion += delegacion;
    });
    return Array.from(map.values());
  }, [filteredByDir]);

  // 6 Detectar pantallas pequeñas
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // 7 Columnas dinámicas según tamaño de pantalla
  const columns = useMemo(() => {
    const base = [
      {
        accessorKey: "departamento",
        header: "Departamento",
      },
    ];
    if (isSmall) {
      base.push({
        id: "combined",
        header: "Colaboración | Delegación",
        Cell: ({ row }) =>
          `${row.original.colaboracion} | ${row.original.delegacion}`,
      });
    } else {
      base.push(
        {
          accessorKey: "colaboracion",
          header: "Tipo Colaboración",
          size: 50,
        },
        {
          accessorKey: "delegacion",
          header: "Tipo Delegación",
          size: 50,
        }
      );
    }
    return base;
  }, [isSmall]);

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={tableData}
        enableSorting={false}
        enableDensityToggle={false}
        enableColumnActions={false}
        enableColumnFilters={false}
        enableFullScreenToggle={false}
        enableGlobalFilter={false}
        enableHiding={false}
        initialState={{ pagination: { pageSize: 5 } }}
        // Toolbar con filtros
        renderTopToolbarCustomActions={() => (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Convenios por Departamento
            </Typography>
            <ButtonGroup size="small" variant="outlined">
              {allDirecciones.map((dir) => (
                <Button
                  key={dir}
                  variant={dir === selectedDir ? "contained" : "outlined"}
                  onClick={() => setSelectedDir(dir)}
                >
                  {dir}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        )}
      />
    </>
  );
}

export default PorDepartamentoTable;
