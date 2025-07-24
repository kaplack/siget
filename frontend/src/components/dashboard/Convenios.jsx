import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProyectosPorEstadoPieChart from "./conveniosComponent/EstadoPorProyecto";
import ConveniosTable from "./conveniosComponent/ConveniosTable";
import PorDepartamentoTable from "./conveniosComponent/PorDepartamentoTable";
import MapaConvenios from "./conveniosComponent/MapaConvenios";

function Convenios() {
  const { agreements: globalAgreements, proyectosPorEstado } = useSelector(
    (state) => state.dashboard.data
  );

  const [agreements, setAgreements] = useState([]);

  // Solo copia una vez los datos de Redux al montar
  useEffect(() => {
    if (globalAgreements?.length > 0 && agreements.length === 0) {
      setAgreements(globalAgreements);
    }
  }, [globalAgreements, agreements]);

  return (
    <div className="row">
      <div className="col-md-3 mb-3">
        <div className="mb-4">
          <ProyectosPorEstadoPieChart data={proyectosPorEstado} />
        </div>
        <div className="mb-2">
          <MapaConvenios agreements={agreements} />
        </div>
      </div>
      <div className="col-md-9 mb-3">
        <div className="mb-4">
          <ConveniosTable agreements={agreements} />
        </div>
        <div className="mb-2">
          <PorDepartamentoTable agreements={agreements} />
        </div>
      </div>
    </div>
  );
}

export default Convenios;
