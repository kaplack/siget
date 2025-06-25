import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaPlusCircle, FaList, FaSignOutAlt } from "react-icons/fa";
import { AiFillDashboard } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { logout, reset } from "../features/auth/authSlice";

function BottomNav() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/");
  };
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
        <AiFillDashboard size={25} />
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
        to="/app/project-list"
        className={`text-white ${
          location.pathname === "/app/project-list" ? "fw-bold" : ""
        }`}
      >
        <FaList size={20} />
      </Link>
      <button
        onClick={onLogout}
        className="text-white bg-transparent border-0"
        style={{ padding: 0 }}
      >
        <FaSignOutAlt size={20} />
      </button>
    </div>
  );
}

export default BottomNav;
