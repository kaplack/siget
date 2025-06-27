import React, { useEffect } from "react";
import { FaClipboardList, FaCalendarCheck, FaChartLine } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { GrMoney } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { getDashboard } from "../features/dashboard/dashboardSlice";
import AvancePorProyectoChart from "../components/dashboard/AvancePorProyecto";
import EstadoPorProyectoPieChart from "../components/dashboard/EstadoPorProyecto";

function Dashboard() {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.dashboard);
  console.log("Dashboard data:", data, "Loading:", loading, "Error:", error);
  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  if (loading) return <p>Cargando dashboard...</p>;
  if (error) return <p>Error: {error.error || "Error desconocido"}</p>;

  if (!data) return null;

  function formatearAMillones(numero) {
    return (numero / 1_000_000).toFixed(2) + " M";
  }

  function formatearConComas(numero) {
    return Number(numero).toLocaleString("en-US"); // o "es-PE" si prefieres
  }

  return (
    <div>
      <h2 className="mb-4">Bienvenido al Sistema SIGET</h2>

      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="siget-card shadow-sm mb-3">
            <div className="siget-card__header">
              <FaClipboardList size={100} className="icon text-primary" />
              <div className="siget-card__header--content">
                <h2>{data.totalFirmados}</h2>
                <p>Convenios Firmados</p>{" "}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="siget-card shadow-sm mb-3">
            <div className="siget-card__header">
              <FaChartLine size={100} className="icon text-primary" />
              <div className="siget-card__header--content">
                <h2>{data.avanceGlobal}%</h2>
                <p>Avance Global</p>{" "}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="siget-card shadow-sm mb-3">
            <div className="siget-card__header">
              <FaUserGroup size={100} className="icon text-primary" />
              <div className="siget-card__header--content">
                <h2>{formatearAMillones(data.totalBeneficiarios)}</h2>
                <p>Personas Beneficiadas</p>{" "}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="siget-card shadow-sm mb-3">
            <div className="siget-card__header">
              <GrMoney size={100} className="icon text-primary" />
              <div className="siget-card__header--content">
                <h2>{formatearAMillones(data.totalInversion)}</h2>
                <p>Inversion Total</p>{" "}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="row">
        <div className="col-md-3 mb-3">
          <EstadoPorProyectoPieChart data={data.proyectosPorEstado} />
        </div>
        <div className="col-md-9 mb-3">
          <AvancePorProyectoChart data={data.avancePorProyecto} />
        </div>
      </div> */}
    </div>
  );
}

export default Dashboard;
