import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaProjectDiagram,
  FaPlus,
  FaFolderPlus,
  FaHome,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { GoProjectRoadmap } from "react-icons/go";
import logo from "../assets/images/Logo_OEDI.png";
import isotipo from "../assets/images/isotipo_OEDI.svg";
import { logout, reset } from "../features/auth/authSlice";

function Sidebar({ collapsed, toggleCollapse }) {
  const sidebarWidth = collapsed ? 80 : 260;
  const [showLabels, setShowLabels] = useState(!collapsed);
  const [openSubmenu, setOpenSubmenu] = useState(false);

  useEffect(() => {
    let timer;
    if (!collapsed) {
      timer = setTimeout(() => setShowLabels(true), 200);
    } else {
      setShowLabels(false);
    }
    return () => clearTimeout(timer);
  }, [collapsed]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/");
  };

  const labelOffset = "40px";

  return (
    <div
      className="shadow bg-light text-dark d-flex flex-column justify-content-between position-fixed top-0 start-0 h-100"
      style={{ width: sidebarWidth, zIndex: 1000, transition: "width 0.3s" }}
    >
      {/* Header */}
      <div className="p-2 border-bottom border-secondary">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            {showLabels && (
              <img
                src={logo}
                alt="Logo"
                style={{
                  width: "70px",
                  height: "auto",
                  objectFit: "contain",
                  transition: "opacity 0.3s",
                }}
                className="me-2"
              />
            )}
            <div className="logo_svg">
              <img
                src={isotipo}
                alt="isotipo"
                style={{
                  width: "30px",
                  opacity: !showLabels ? 1 : 0,
                  transform: "scale(.75)",
                  transition: "opacity transform 0.3s",
                  textAlign: "right",
                }}
              />
            </div>
          </div>
          <button className="btn btn-sm btn-light" onClick={toggleCollapse}>
            {collapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-2 flex-grow-1">
        <ul className="nav flex-column">
          <SidebarItem
            to="/app/dashboard"
            icon={<FaHome />}
            label="Dashboard"
            showLabels={showLabels}
          />

          <SidebarItemWithSubmenu
            icon={<FaProjectDiagram />}
            label="Gestión de Proyectos"
            showLabels={showLabels}
            collapsed={collapsed}
            open={openSubmenu}
            toggle={() => setOpenSubmenu(!openSubmenu)}
            submenuItems={[
              {
                to: "/app/project/new",
                icon: <FaFolderPlus />,
                label: "Proyecto",
              },
              {
                to: "/app/project-list",
                icon: <GoProjectRoadmap />,
                label: "Proyectos activos",
              },
            ]}
          />
        </ul>
      </div>

      {/* Footer */}
      <div className="p-2 border-top border-secondary">
        <ul className="nav flex-column">
          <SidebarItem
            to="/app/admin"
            icon={<FaCog />}
            label="Admin"
            showLabels={showLabels}
          />
          <li className="nav-item mb-2" style={{ position: "relative" }}>
            <button
              className="nav-link text-dark"
              onClick={onLogout}
              style={{ position: "relative" }}
            >
              <div style={{ display: "inline-block", marginRight: "10px" }}>
                <FaSignOutAlt />
              </div>
              <span
                style={{
                  position: "absolute",
                  marginTop: "2px",
                  left: showLabels ? labelOffset : "-999px",
                  opacity: showLabels ? 1 : 0,
                  transition: "opacity 0.3s, left 0.3s",
                  whiteSpace: "nowrap",
                }}
              >
                Cerrar Sesión
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Ítem simple
function SidebarItem({ to, icon, label, showLabels }) {
  const labelOffset = "40px";
  return (
    <li className="nav-item mb-2" style={{ position: "relative" }}>
      <Link
        to={to}
        className="nav-link text-dark"
        style={{ position: "relative" }}
      >
        <div style={{ display: "inline-block", marginRight: "10px" }}>
          {icon}
        </div>
        <span
          style={{
            position: "absolute",
            marginTop: "2px",
            left: showLabels ? labelOffset : "-999px",
            opacity: showLabels ? 1 : 0,
            transition: "opacity 0.3s, left 0.3s",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}

// Ítem con submenú
function SidebarItemWithSubmenu({
  icon,
  label,
  showLabels,
  collapsed,
  open,
  toggle,
  submenuItems,
}) {
  const [hover, setHover] = useState(false);
  const labelOffset = "40px";
  const liRef = useRef(null);
  const [positionTop, setPositionTop] = useState(0);

  useEffect(() => {
    if (hover && liRef.current) {
      const rect = liRef.current.getBoundingClientRect();
      setPositionTop(rect.top);
    }
  }, [hover]);

  return (
    <li
      className="nav-item mb-2"
      style={{ position: "relative" }}
      onMouseEnter={() => collapsed && setHover(true)}
      onMouseLeave={() => collapsed && setHover(false)}
      ref={liRef}
    >
      <button
        className="nav-link text-dark"
        onClick={!collapsed ? toggle : undefined}
        style={{ position: "relative", width: "100%", textAlign: "left" }}
      >
        <div style={{ display: "inline-block", marginRight: "10px" }}>
          {icon}
        </div>

        <span
          style={{
            position: "absolute",
            marginTop: "2px",
            left: showLabels ? labelOffset : "-999px",
            opacity: showLabels ? 1 : 0,
            transition: "opacity 0.3s, left 0.3s",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>

        {showLabels && (
          <span
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {open ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        )}
      </button>

      {/* Submenú normal cuando expandido */}
      {!collapsed && (
        <div
          style={{
            maxHeight: open ? "500px" : "0",
            overflow: "hidden",
            transition: "max-height 0.3s ease",
          }}
        >
          <ul className="nav flex-column ms-4">
            {submenuItems.map((item, index) => (
              <SidebarItem
                key={index}
                to={item.to}
                icon={item.icon}
                label={item.label}
                showLabels={true}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Submenú flotante cuando colapsado */}
      {collapsed && hover && (
        <div
          style={{
            minWidth: "250px",
            position: "fixed",
            top: `${positionTop}px`,
            left: "60px",
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "4px",
            boxShadow: "0 0 5px rgba(0,0,0,0.3)",
            zIndex: 9999,
          }}
        >
          <ul className="nav flex-column">
            {submenuItems.map((item, index) => (
              <SidebarItem
                key={index}
                to={item.to}
                icon={item.icon}
                label={item.label}
                showLabels={true}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export default Sidebar;
