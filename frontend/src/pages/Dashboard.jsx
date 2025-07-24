import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { FaClipboardList, FaChartLine } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { GrMoney } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { getDashboard } from "../features/dashboard/dashboardSlice";

import { CircularProgress } from "@mui/material";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, loading, error } = useSelector((state) => state.dashboard);

  const [vistaActiva, setVistaActiva] = useState("convenios");

  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("convenios")) {
      setVistaActiva("convenios");
    } else if (location.pathname.includes("avance")) {
      setVistaActiva("avance");
    }
  }, [location.pathname]);

  useEffect(() => {
    dispatch(getDashboard());
  }, [dispatch]);

  if (loading)
    return (
      <>
        <div className="d-flex flex-column  vh-100 justify-content-center align-items-center">
          <p>Cargando dashboard</p>
          <br />
          <CircularProgress />
        </div>
      </>
    );
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
      <h2 className="mb-4">Dashboard SIGEC</h2>

      <div className="row">
        <div className="col-md-3 mb-3">
          <div
            className={`siget-card-style siget-card mb-3 ${
              vistaActiva === "convenios" ? "shadow-lg bg-#bfc6ce" : ""
            }`}
            style={{ cursor: "pointer", transition: "all 0.2s ease-in-out" }}
            onClick={() => {
              setVistaActiva("convenios");
              navigate("/app/dashboard/convenios");
            }}
          >
            <div className="siget-card__header">
              <FaClipboardList className="icon text-primary" />
              <div className="siget-card__header--content">
                <h2>{data.totalFirmados}</h2>
                <p>Convenios Firmados</p>{" "}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div
            className={`siget-card-style siget-card mb-3 ${
              vistaActiva === "avance" ? "shadow-lg" : ""
            }`}
            style={{ cursor: "pointer", transition: "all 0.2s ease-in-out" }}
            onClick={() => {
              setVistaActiva("avance");
              navigate("/app/dashboard/avance");
            }}
          >
            <div className="siget-card__header">
              <FaChartLine className="icon text-primary" />
              <div className="siget-card__header--content">
                <h2>{data.avanceGlobal}%</h2>
                <p>Avance Global</p>{" "}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="siget-card-style siget-card mb-3">
            <div className="siget-card__header">
              <FaUserGroup className="icon text-primary" />
              <div className="siget-card__header--content">
                <h2>{formatearAMillones(data.totalBeneficiarios)}</h2>
                <p>Personas Beneficiadas</p>{" "}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="siget-card-style siget-card mb-3">
            <div className="siget-card__header">
              <GrMoney className="icon text-primary" />
              <div className="siget-card__header--content">
                <h2>{formatearAMillones(data.totalInversion)}</h2>
                <p>Inversion Total</p>{" "}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Este es el componente que mostrará Convenios o Avance */}
      <Outlet />
    </div>
  );
}

export default Dashboard;
