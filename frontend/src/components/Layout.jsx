import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav"; // Asegúrate de tenerlo implementado
import { Outlet } from "react-router-dom";

function Layout() {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapse = () => setCollapsed(!collapsed);
  const sidebarWidth = collapsed ? 80 : 250;

  return (
    <div className="d-flex flex-column">
      <div className="d-flex">
        {!isMobile && (
          <Sidebar collapsed={collapsed} toggleCollapse={toggleCollapse} />
        )}

        <div
          className="flex-grow-1 p-3 bg-light-subtle"
          style={{
            marginLeft: isMobile ? 0 : sidebarWidth,
            transition: "margin-left 0.3s",
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </div>
      </div>

      {isMobile && <BottomNav />}
    </div>
  );
}

export default Layout;
