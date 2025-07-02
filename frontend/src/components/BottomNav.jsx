import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaPlusCircle,
  FaList,
  FaSignOutAlt,
  FaChartPie,
  FaFolderPlus,
  FaTasks,
} from "react-icons/fa";
import { GoProjectRoadmap } from "react-icons/go";
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
        <FaChartPie size={23} />
      </Link>

      <Link
        to="/app/project/new"
        className={`text-white ${
          location.pathname === "/app/project/new" ? "fw-bold" : ""
        }`}
      >
        <FaFolderPlus size={23} />
      </Link>

      <Link
        to="/app/project-list"
        className={`text-white ${
          location.pathname === "/app/project-list" ? "fw-bold" : ""
        }`}
      >
        <FaTasks size={23} />
      </Link>
      <button
        onClick={onLogout}
        className="text-white bg-transparent border-0"
        style={{ padding: 0 }}
      >
        <FaSignOutAlt size={23} />
      </button>
    </div>
  );
}

export default BottomNav;
