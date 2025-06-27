import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

const ProyectosPorEstadoPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No hay datos de proyectos por estado.</p>;
  }

  const estadosMapeados = {
    borrador: "En Planificación",
    ejecucion: "En ejecución",
    linea_base: "Línea Base Establecida",
  };

  const dataTransformada = data.map((item) => ({
    ...item,
    estado: estadosMapeados[item.estado] || item.estado,
    cantidad: Number(item.cantidad),
  }));

  return (
    <div style={{ width: "100%", height: 500 }}>
      <h3>Convenios por Estado</h3>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={dataTransformada}
            dataKey="cantidad"
            nameKey="estado"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {dataTransformada.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProyectosPorEstadoPieChart;
