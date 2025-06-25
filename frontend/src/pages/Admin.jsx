import React from "react";

function Admin() {
  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h1 className="mb-4">Panel de Administración</h1>
        <p>ESTA SECCION ES SOLO DE MUESTRA</p>
        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="card p-3 h-100 shadow-sm">
              <h5>Gestión de Usuarios</h5>
              <p>Administrar usuarios, roles y permisos.</p>
              <button className="btn btn-primary">Ir a Usuarios</button>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card p-3 h-100 shadow-sm">
              <h5>Configuración del Sistema</h5>
              <p>Modificar parámetros generales de la aplicación.</p>
              <button className="btn btn-primary">Ir a Configuración</button>
            </div>
          </div>

          {/* Puedes seguir agregando más tarjetas de administración */}
        </div>
      </div>
    </div>
  );
}

export default Admin;
