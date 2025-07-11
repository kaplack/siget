import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  Legend,
} from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Title,
  Legend
);

const AvancePorProyectoChart = ({ data }) => {
  console.log(data);

  if (!data || data.length === 0)
    return <p>No hay datos de avance por proyecto.</p>;

  if (!Array.isArray(data)) return <p>Error: data no es un array</p>;

  const chartData = {
    labels: data.map((d) =>
      d.alias.length > 14 ? d.alias.slice(0, 12) + "…" : d.alias
    ),
    datasets: [
      {
        label: "Planificado",
        data: data.map((d) => d.avancePlanificado ?? 0),
        backgroundColor: "#0288d1", // verde
        borderRadius: 4,
      },
      {
        label: "Real",
        data: data.map((d) => d.avanceReal ?? 0),
        backgroundColor: "#ff9800", // azul
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`,
        },
      },
    },
    scales: {
      x: {
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
      y: {
        ticks: {
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="siget-card-style">
      <h5>Avance Real vs Avance Planificado</h5>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default AvancePorProyectoChart;
