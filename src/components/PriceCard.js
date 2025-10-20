import React from "react";
import { motion } from "framer-motion";

function PriceCard({ item }) {
  const priceList = Array.isArray(item.price)
    ? item.price
    : item.price?.split("\n") || [];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
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
        <h5 className="fw-semibold mb-2" style={{ fontSize: "1.4rem" }}>
          {item.icon} {item.name}
        </h5>

        {/* Tampilkan stok hanya untuk kategori premium */}
        {item.category === "premium" && (
          <div
            className={`small fw-semibold ${
              item.stock <= 0 ? "text-danger" : "text-success"
            }`}
          >
            {item.stock <= 0 ? "Sold Out" : `Stok: ${item.stock}`}
          </div>
        )}

        {/* Daftar harga */}
        <ul
          className="list-unstyled text-dark fw-medium text-start mt-3"
          style={{ fontSize: "0.95rem", lineHeight: "1.5" }}
        >          {priceList.map((p, i) => (
            <li key={i}>🔹 {p}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export default PriceCard;
