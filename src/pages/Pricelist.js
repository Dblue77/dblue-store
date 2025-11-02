import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";
import NavbarComp from "../components/Navbar";
import Header from "../components/Header";
import CategoryBar from "../components/CategoryBar";
import PriceCard from "../components/PriceCard";
import Footer from "../components/Footer";

export default function Pricelist() {
  const [category, setCategory] = useState("sosmed");
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [sortBy, setSortBy] = useState("name"); // name | newest
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    const fetchData = async () => {
      setLoading(true);
      setErr("");
      const { data: priceList, error } = await supabase
        .from("pricelist")
        .select("*")
        .eq("category", category);

      if (!alive) return;
      if (error) {
        console.error("Error fetching data:", error);
        setErr("Gagal memuat data. Coba refresh.");
        setData([]);
      } else {
        setData(priceList || []);
      }
      setLoading(false);
    };

    fetchData();
    return () => {
      alive = false;
    };
  }, [category]);

  // Filter + Sort client-side
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = (data || []).filter((item) =>
      (item?.name || "").toLowerCase().includes(q)
    );
    if (sortBy === "name") {
      list = list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "newest") {
      list = list.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
    return list;
  }, [data, search, sortBy]);

  return (
    <div style={{ background: "linear-gradient(180deg, #e7f4ff, #fff)" }}>
      <NavbarComp />
      <Header search={search} setSearch={setSearch} />

      {/* Small CSS for shimmer */}
      <style>{`
        .shimmer {
          background: linear-gradient(90deg, #eef6ff 0%, #f7fbff 40%, #eef6ff 80%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite linear;
        }
        @keyframes shimmer {
          0% {background-position: 200% 0}
          100% {background-position: -200% 0}
        }
        .card-soft { border-radius: 12px; }
      `}</style>

      <div className="container my-4">
        <CategoryBar category={category} setCategory={setCategory} />

        {/* Toolbar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 mb-2">
          <div className="text-secondary">
            {loading ? "Memuat…" : `${filteredData.length} produk`}
            <span className="ms-2 small text-muted">• Kategori: {category}</span>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <label className="small text-secondary">Urutkan</label>
            <select
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="name">Nama (A–Z)</option>
              <option value="newest">Terbaru</option>
            </select>
          </div>
        </div>

        {/* States */}
        {err ? (
          <div className="alert alert-warning my-4">{err}</div>
        ) : loading ? (
          <div className="row g-4 mt-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={i}>
                <div className="card card-soft shadow-sm p-3">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="shimmer"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        marginRight: 10,
                      }}
                    />
                    <div className="flex-grow-1">
                      <div
                        className="shimmer"
                        style={{ height: 12, borderRadius: 6, width: "70%" }}
                      />
                      <div
                        className="shimmer mt-2"
                        style={{ height: 10, borderRadius: 6, width: "40%" }}
                      />
                    </div>
                  </div>
                  <div
                    className="shimmer"
                    style={{ height: 12, borderRadius: 6, width: "90%" }}
                  />
                  <div
                    className="shimmer mt-2"
                    style={{ height: 12, borderRadius: 6, width: "65%" }}
                  />
                  <div className="d-flex justify-content-end mt-3">
                    <div
                      className="shimmer"
                      style={{ height: 36, width: 100, borderRadius: 8 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            <div className="mb-2">Tidak ada produk yang cocok.</div>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setSearch("")}
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="row g-4 mt-2">
            {filteredData.map((item, i) => (
              <motion.div
                key={item.id || i}
                className="col-lg-3 col-md-4 col-sm-6 col-12"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.25, delay: (i % 8) * 0.03 }}
              >
                <PriceCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
