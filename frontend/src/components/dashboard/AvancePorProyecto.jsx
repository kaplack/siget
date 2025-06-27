import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

const AvancePorProyectoChart = ({ data }) => {
  if (!data || data.length === 0)
    return <p>No hay datos de avance por proyecto.</p>;

  console.log("AvancePorProyectoChart → data:", data);

  if (!Array.isArray(data)) {
    return <p>Error: data no es un array</p>;
  }

  if (data.some((d) => typeof d.avance !== "number")) {
    return <p>Error: al menos un avance no es número</p>;
  }

  return (
    <div style={{ width: "100%", height: data.length * 40 }}>
      <h3>Avance por Proyecto</h3>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          width={250}
          barSize={25}
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="nombreConvenio"
            width={10}
            tickFormatter={(name) =>
              name.length > 14 ? name.slice(0, 12) + "…" : name
            }
          />
          <Tooltip formatter={(value) => `${value}%`} />
          <Bar dataKey="avance" fill="#8884d8">
            <LabelList
              dataKey="avance"
              position="insideRight"
              formatter={(v) => `${v}%`}
              style={{ fill: "#fff", fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AvancePorProyectoChart;
