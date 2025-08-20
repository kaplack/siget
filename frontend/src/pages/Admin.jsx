import React from "react";
import { Link } from "react-router-dom";

function Admin() {
  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h1 className="mb-4">Panel de Administración</h1>

        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="card p-3 h-100 shadow-sm">
              <h5>Gestión de Usuarios</h5>
              <p>Administrar usuarios y roles.</p>
              <Link to="/app/userlist" className="btn btn-primary">
                Ir a Usuarios
              </Link>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card p-3 h-100 shadow-sm">
              <h5>Gestión de Perfiles</h5>
              <p>Crear, editar y eliminar perfiles de usuario.</p>
              <Link to="/app/profiles" className="btn btn-primary">
                Ir a Perfiles
              </Link>
            </div>
          </div>

          {/* <div className="col-md-4 mb-3">
            <div className="card p-3 h-100 shadow-sm">
              <h5>Configuración del Sistema</h5>
              <p>Modificar parámetros generales de la aplicación.</p>
              <Link to="/settings" className="btn btn-primary">
                Ir a Configuración
              </Link>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Admin;
