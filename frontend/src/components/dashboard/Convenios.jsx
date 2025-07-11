import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProyectosPorEstadoPieChart from "./conveniosComponent/EstadoPorProyecto";
import ConveniosTable from "./conveniosComponent/ConveniosTable";

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
        <ProyectosPorEstadoPieChart data={proyectosPorEstado} />
      </div>
      <div className="col-md-9 mb-5">
        <ConveniosTable agreements={agreements} />
      </div>
    </div>
  );
}

export default Convenios;
