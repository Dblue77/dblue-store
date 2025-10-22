import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // ✅ tambahkan ini

function PriceCard({ item }) {
  const priceList = Array.isArray(item.price)
    ? item.price
    : (item.price ? item.price.split("\n") : []);

  const hasDetail = typeof item?.id !== "undefined" && item.id !== null;

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
        {/* Nama produk */}
        <h5 className="fw-semibold mb-2" style={{ fontSize: "1.25rem" }}>
          {item.icon} {item.name}
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
            to={`/products/${item.id}`}        // ✅ route detail
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
