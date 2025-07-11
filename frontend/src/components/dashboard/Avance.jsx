import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import AvancePorProyectoChart from "./avanceComponent/AvancePorProyecto";
import AvanceTable from "./avanceComponent/AvanceTable";

function Avance() {
  const { avancePlanificado, avancePorProyecto, avanceTabla } = useSelector(
    (state) => state.dashboard.data
  );

  // genera array de avance comparativo
  const comparacionAvance = useMemo(() => {
    if (!avancePlanificado?.avancePorProyecto) return [];

    return avancePlanificado.avancePorProyecto.map((planificado) => {
      const real = avancePorProyecto?.find(
        (r) => r.projectId === planificado.projectId
      );

      return {
        alias: planificado.alias,
        avancePlanificado: planificado.avancePonderado ?? null,
        avanceReal: real?.avance ?? null, // si no hay seguimiento, dejamos null
      };
    });
  }, [avancePlanificado, avancePorProyecto]);

  return (
    <div className="row">
      <div className="col-md-12 mb-5">
        <AvanceTable data={avanceTabla} />
      </div>
    </div>
  );
}

export default Avance;
