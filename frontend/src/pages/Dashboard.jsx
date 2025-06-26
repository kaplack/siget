import React, { useEffect } from "react";
import { FaClipboardList, FaCalendarCheck, FaChartLine } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getDashboard } from "../features/dashboard/dashboardSlice";

function Dashboard() {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.dashboard);
  console.log("Dashboard data:", data, "Loading:", loading, "Error:", error);
  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  if (loading) return <p>Cargando dashboard...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return null;

  return (
    <div>
      <h2 className="mb-4">Bienvenido al Sistema SIGET</h2>

      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <FaClipboardList size={40} className="mb-3 text-primary" />
              <h5>Convenios Firmados</h5>
              <p>{data.totalFirmados}</p>{" "}
              {/* Aquí luego pondrás datos dinámicos */}
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <FaCalendarCheck size={40} className="mb-3 text-success" />
              <h5>Actividades Programadas</h5>
              <p>{data.totalActividadesEjecutables}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <FaChartLine size={40} className="mb-3 text-warning" />
              <h5>Avance Global</h5>
              <p>{data.avanceGlobal}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
