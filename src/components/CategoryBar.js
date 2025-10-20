import React from "react";
import { motion } from "framer-motion";

const categories = [
  { key: "premium", label: "🌟 APP Premium" },
  { key: "sosmed", label: "📱 Sosial Media" },
  { key: "pulsa", label: "🎫 Pulsa" },
  { key: "ewallet", label: "💳 E-Wallet" },
];

function CategoryBar({ category, setCategory }) {
  return (
    <div
      className="d-flex flex-nowrap gap-2 overflow-x-auto pb-2 px-3 justify-content-md-center"
      style={{
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {categories.map((cat) => (
        <motion.button
          key={cat.key}
          whileTap={{ scale: 0.95 }}
          className={`btn ${
            category === cat.key ? "btn-primary" : "btn-outline-primary"
          } rounded-pill px-3 fw-semibold flex-shrink-0`}
          onClick={() => setCategory(cat.key)}
        >
          {cat.label}
        </motion.button>
      ))}
    </div>
  );
}

export default CategoryBar;
