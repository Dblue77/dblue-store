import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function AdminNavbar({ onSignOut }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 sticky-top border-bottom">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={close}>
          <img src={logo} alt="Dblue Store" width="36" height="36" className="rounded-circle" />
          <span className="fw-bold text-primary">Admin • Dblue Store</span>
        </Link>

        {/* Toggler (React-controlled, no Bootstrap JS needed) */}
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="adminNav"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Links */}
        <div className={`collapse navbar-collapse ${open ? "show" : ""}`} id="adminNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link className="nav-link px-3" to="/admin" onClick={close}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/admin-testimonials" onClick={close}>
                Kelola Testimoni
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/" onClick={close}>
                Lihat Situs
              </Link>
            </li>
            <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
              <button
                className="btn btn-sm btn-danger px-3"
                onClick={() => { close(); onSignOut?.(); }}
              >
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Style kecil */}
      <style>{`
        .navbar.sticky-top { z-index: 1050; }
        .navbar .nav-link { color: #495057; }
        .navbar .nav-link:hover { color: #0d6efd; }
      `}</style>
    </nav>
  );
}
