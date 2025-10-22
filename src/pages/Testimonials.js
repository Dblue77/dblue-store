import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import NavbarComp from "../components/Navbar";
import Footer from "../components/Footer"; // ✅ tambah footer

export default function Testimonials() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setList(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = q
    ? list.filter((it) =>
        (it.name + " " + it.message).toLowerCase().includes(q.toLowerCase())
      )
    : list;

  return (
    <div style={{ background: "linear-gradient(180deg, #e7f4ff, #fff)" }}>
      {/* === Navbar === */}
      <NavbarComp />

      <div className="container py-4">
        {/* Header & Search */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <h4 className="fw-semibold mb-2 text-dark">Testimoni</h4>
          <input
            className="form-control shadow-sm"
            style={{ width: 260, maxWidth: "100%" }}
            placeholder="Cari testimoni…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-5">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-muted text-center py-5">
            Belum ada testimoni.
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map((t) => (
              <div className="col-12 col-sm-6 col-lg-4" key={t.id}>
                <div
                  className="card shadow-sm border-0 h-100"
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    transition: "transform 0.2s",
                  }}
                >
                  {t.photo_url && (
                    <img
                      src={t.photo_url}
                      alt={t.name}
                      className="card-img-top"
                      style={{
                        width: "100%",
                        height: "750px", // ✅ fix height poster
                        objectFit: "cover",
                        borderBottom: "4px solid #0dcaf0",
                        backgroundColor: "#000",
                      }}
                      loading="lazy"
                    />
                  )}

                  <div className="card-body">
                    <h6 className="mb-1 fw-semibold text-dark">
                      {t.name || "Anonim"}
                    </h6>
                    <small className="text-muted">
                      {new Date(t.created_at).toLocaleDateString("id-ID")}
                      {t.product_id ? ` • Produk #${t.product_id}` : ""}
                    </small>
                    <p
                      className="small mt-2 mb-0 text-secondary"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {t.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === Footer === */}
      <Footer />
    </div>
  );
}
