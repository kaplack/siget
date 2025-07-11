import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const estadoColoresHex = {
  "En Planificación": "#e0e0e0",
  "Línea Base Establecida": "#0288d1",
  "En ejecución": "#ff9800",
  finalizado: "#4caf50",
  cancelado: "#f44336",
};

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
    <div
      className="siget-card-style  shadow-sm"
      style={{ width: "100%", height: 500 }}
    >
      <h4 className="m-0">Convenios por Estado</h4>
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
                fill={estadoColoresHex[entry.estado] || "#8884d8"} // fallback
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
