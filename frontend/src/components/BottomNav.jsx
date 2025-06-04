import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaPlusCircle, FaList } from "react-icons/fa";

function BottomNav() {
  const location = useLocation();

  return (
    <div
      className="bg-dark text-white d-flex justify-content-around align-items-center position-fixed bottom-0 start-0 w-100"
      style={{ height: "60px", zIndex: 1050 }}
    >
      <Link
        to="/app/dashboard"
        className={`text-white ${
          location.pathname === "/app/dashboard" ? "fw-bold" : ""
        }`}
      >
        <FaHome size={20} />
      </Link>

      <Link
        to="/app/project/new"
        className={`text-white ${
          location.pathname === "/app/project/new" ? "fw-bold" : ""
        }`}
      >
        <FaPlusCircle size={20} />
      </Link>

      <Link
        to="/app/proyectos"
        className={`text-white ${
          location.pathname === "/app/proyectos" ? "fw-bold" : ""
        }`}
      >
        <FaList size={20} />
      </Link>
      <Link
        to="/app/proyectos"
        className={`text-white ${
          location.pathname === "/app/proyectos" ? "fw-bold" : ""
        }`}
      >
        <FaList size={20} />
      </Link>
    </div>
  );
}

export default BottomNav;
