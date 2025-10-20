import React from "react";
import { motion } from "framer-motion";

function Footer() {
  return (
    <>
      {" "}
      <footer className="text-center py-4 mt-5 border-top">
        {" "}
        <div className="d-flex justify-content-center gap-4 mb-3 fs-3">
          {" "}
          <a
            href="https://t.me/Dblueee"
            target="_blank"
            rel="noopener noreferrer"
            className="telegram-icon"
          >
            {" "}
            <i className="bi bi-telegram"></i>{" "}
          </a>{" "}
          <a
            href="https://instagram.com/dbluestoree"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-icon"
          >
            {" "}
            <i className="bi bi-instagram"></i>{" "}
          </a>{" "}
        </div>
        ```
        <p className="text-muted small mb-0">
          © 2025 Dblue Store — All rights reserved.
        </p>
      </footer>
      <motion.a
        href={`https://wa.me/6289515939531?text=${encodeURIComponent(
          "Halo min, Saya ingin order"
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.1 }}
      >
        <i className="bi bi-whatsapp"></i>
        <span className="tooltip-text">Order di sini</span>
      </motion.a>
      <style>{`
    .telegram-icon {
      color: #0088cc;
      transition: transform 0.2s ease;
    }
    .telegram-icon:hover {
      transform: scale(1.2);
    }

    .instagram-icon {
      background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      transition: transform 0.2s ease;
    }
    .instagram-icon:hover {
      transform: scale(1.2);
    }

    /* Tombol WhatsApp bulat */
    .whatsapp-float {
      position: fixed;
      bottom: 25px;
      right: 25px;
      background-color: #25D366;
      color: white;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30px;
      text-decoration: none;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      z-index: 1000;
    }

    .whatsapp-float:hover {
      background-color: #1ebe5b;
    }

    .whatsapp-float .tooltip-text {
      position: absolute;
      right: 70px;
      background: #25D366;
      color: white;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 13px;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      white-space: nowrap;
    }

    .whatsapp-float:hover .tooltip-text {
      opacity: 1;
    }
  `}</style>
    </>
  );
}

export default Footer;
