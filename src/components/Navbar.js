import React from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

function Navbar() {
  const closeCollapse = () => {
    const el = document.getElementById("navbarNav");
    if (el && el.classList.contains("show")) {
      el.classList.remove("show");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 sticky-top border-bottom">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={closeCollapse}>
          <img
            src={logo}
            alt="Dblue Store Logo"
            width="40"
            height="40"
            className="rounded-circle"
            loading="lazy"
          />
          <span className="fw-bold text-primary">Dblue Store</span>
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Nav links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <NavLink
                end
                to="/"
                className={({ isActive }) =>
                  "nav-link px-3" + (isActive ? " active fw-semibold text-primary" : "")
                }
                onClick={closeCollapse}
              >
                Beranda
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/testimonials"
                className={({ isActive }) =>
                  "nav-link px-3" + (isActive ? " active fw-semibold text-primary" : "")
                }
                onClick={closeCollapse}
              >
                Testimoni
              </NavLink>
            </li>

            {/* <li className="nav-item">
              <NavLink
                to="/order-guide"
                className={({ isActive }) =>
                  "nav-link px-3" + (isActive ? " active fw-semibold text-primary" : "")
                }
                onClick={closeCollapse}
              >
                Cara Pemesanan
              </NavLink>
            </li> */}

          </ul>
        </div>
      </div>

      {/* Style kecil untuk hover/active */}
      <style>{`
        .navbar .nav-link {
          color: #495057;
        }
        .navbar .nav-link:hover {
          color: #0d6efd;
        }
        .navbar .nav-link.active {
          position: relative;
        }
        .navbar .nav-link.active::after {
          content: "";
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: -6px;
          height: 2px;
          background: #0d6efd;
          border-radius: 2px;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
