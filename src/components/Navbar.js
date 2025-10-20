import React from "react";
import logo from "../assets/logo.png"

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm py-3">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img
            src={logo}
            alt="Dblue Store Logo"
            width="50"
            height="50"
            className="me-1 rounded-circle"
          />
          <span className="fw-bold text-primary">Dblue Store</span>
        </a>
        <div className ="container d-flex flex-column align-items-start">
          <span className ="text-secondary small d-flex mt-1 fw-bold ">Jual Apk premium, suntik all sosmed, pulsa, e-wallet </span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
