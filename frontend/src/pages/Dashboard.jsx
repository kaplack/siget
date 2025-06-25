import React from "react";
import { FaClipboardList, FaCalendarCheck, FaChartLine } from "react-icons/fa";

function Dashboard() {
  return (
    <div>
      <h2 className="mb-4">Bienvenido al Sistema SIGET</h2>
      <p>ESTA SECCION ESTÁ POR IMPLEMENTARSE</p>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <FaClipboardList size={40} className="mb-3 text-primary" />
              <h5>Proyectos Registrados</h5>
              <p>25</p> {/* Aquí luego pondrás datos dinámicos */}
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <FaCalendarCheck size={40} className="mb-3 text-success" />
              <h5>Actividades Programadas</h5>
              <p>40</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <FaChartLine size={40} className="mb-3 text-warning" />
              <h5>Avance Global</h5>
              <p>72%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
