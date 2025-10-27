import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function PriceCard({ item }) {
  // pisahkan list harga
  const priceList = Array.isArray(item.price)
    ? item.price
    : item.price
    ? item.price.split("\n")
    : [];

  const hasDetail = typeof item?.id !== "undefined" && item.id !== null;

  // ambil foto / logo dari database (fallback ke default)
  const imageSrc =
    item.photo_url || item.logo || "/default-logo.png"; // ubah default sesuai kebutuhan

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.99 }}
      className="card text-center border-0 shadow-sm p-3 rounded-4 h-100"
      style={{
        background: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        {/* Foto/logo produk */}
        <div className="mb-3 text-center">
          <img
            src={imageSrc}
            alt={item.name}
            loading="lazy"
            style={{
              width: 100,
              height: 100,
              objectFit: "cover",
              borderRadius: 20,
              border: "1px solid #E5E9F0",
              background: "#F8FAFF",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          />
        </div>

        {/* Nama produk */}
        <h5 className="fw-semibold mb-2" style={{ fontSize: "1.15rem" }}>
          {item.name}
        </h5>

        {/* Stok hanya untuk kategori premium */}
        {item.category === "premium" && (
          <div
            className={`small fw-semibold ${
              (item.stock ?? 0) <= 0 ? "text-danger" : "text-success"
            }`}
          >
            {(item.stock ?? 0) <= 0 ? "Sold Out" : `Stok: ${item.stock}`}
          </div>
        )}

        {/* Daftar harga */}
        <ul
          className="list-unstyled text-dark fw-medium text-start mt-3 mb-0"
          style={{ fontSize: "0.95rem", lineHeight: "1.5" }}
        >
          {priceList.map((p, i) => (
            <li key={i}>🔹 {p}</li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-3">
        <hr className="my-2" />
        {hasDetail ? (
          <Link
            to={`/products/${item.id}`}
            className="btn btn-outline-primary w-100"
            aria-label={`Lihat detail ${item.name}`}
          >
            Detail
          </Link>
        ) : (
          <button
            className="btn btn-outline-secondary w-100"
            disabled
            title="Detail tidak tersedia"
          >
            Detail
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default PriceCard;
