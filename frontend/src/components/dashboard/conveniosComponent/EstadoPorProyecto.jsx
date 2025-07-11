import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

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
    estado: estadosMapeados[item.estado] || item.estado,
    cantidad: Number(item.cantidad),
  }));

  const total = dataTransformada.reduce((sum, i) => sum + i.cantidad, 0);

  const chartData = {
    labels: dataTransformada.map((item) => item.estado),
    datasets: [
      {
        label: "Cantidad",
        data: dataTransformada.map((item) => item.cantidad),
        backgroundColor: dataTransformada.map(
          (item) => estadoColoresHex[item.estado] || "#8884d8"
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      datalabels: {
        // comments in English
        formatter: (value, ctx) => {
          const porcentaje = ((value / total) * 100).toFixed(0);
          return `${value}, ${porcentaje}%`;
        },
        color: "#fff",
        font: { weight: "bold", size: 14 },
        anchor: "center",
        align: "center",
      },
    },
  };

  return (
    <div className="siget-card-style shadow-sm">
      <h4 className="mb-3">Convenios por Estado</h4>
      <Pie
        data={chartData}
        options={chartOptions}
        plugins={[ChartDataLabels]}
      />
    </div>
  );
};

export default ProyectosPorEstadoPieChart;
