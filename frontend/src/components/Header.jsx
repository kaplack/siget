import React from "react";
import { FaBars } from "react-icons/fa";

function Header({ toggleMobile }) {
  return (
    <div className="bg-white p-2 d-flex justify-content-between align-items-center">
      <button className="btn" onClick={toggleMobile}>
        <FaBars />
      </button>
      <h5 className="mb-0">OEDI</h5>
    </div>
  );
}

export default Header;
