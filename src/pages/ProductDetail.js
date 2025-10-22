import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [testi, setTesti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fmtIDR = useMemo(
    () =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }),
    []
  );

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const [{ data: prod, error: e1 }, { data: t, error: e2 }] = await Promise.all([
          supabase.from("pricelist").select("*").eq("id", id).single(),
          supabase
            .from("testimonials")
            .select("*")
            .eq("product_id", id)
            .order("created_at", { ascending: false }),
        ]);

        if (e1 || e2) {
          throw new Error(e1?.message || e2?.message || "Gagal memuat data");
        }

        if (isMounted) {
          setProduct(prod || null);
          setTesti(Array.isArray(t) ? t : []);
          if (prod?.name) document.title = `${prod.name} · Detail Produk`;
        }
      } catch (e) {
        if (isMounted) setErr(e.message || "Terjadi kesalahan");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const Skeleton = () => (
    <div className="container py-4">
      <div className="placeholder-glow mb-3">
        <span className="placeholder col-3"></span>
      </div>
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="placeholder-glow">
                <span className="placeholder col-8"></span>
              </h4>
              <div className="placeholder-glow">
                <span className="placeholder col-4"></span>
              </div>
              <div className="mt-3 d-grid gap-2">
                <span className="placeholder col-6"></span>
                <span className="placeholder col-5"></span>
                <span className="placeholder col-4"></span>
              </div>
              <p className="placeholder-glow mt-3 mb-0">
                <span className="placeholder col-12"></span>
                <span className="placeholder col-10"></span>
                <span className="placeholder col-8"></span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Testimoni Produk Ini</h5>
          </div>
          <div className="row g-3">
            {[...Array(4)].map((_, i) => (
              <div className="col-md-6" key={i}>
                <div className="card h-100 shadow-sm">
                  <div
                    className="card-img-top placeholder"
                    style={{ height: 160 }}
                  />
                  <div className="card-body">
                    <h6 className="placeholder-glow">
                      <span className="placeholder col-6"></span>
                    </h6>
                    <small className="text-muted placeholder col-4 d-inline-block"></small>
                    <p className="small mt-2 mb-0 placeholder-glow">
                      <span className="placeholder col-12"></span>
                      <span className="placeholder col-10"></span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <Skeleton />;

  if (err)
    return (
      <div className="container py-5">
        <div className="alert alert-danger d-flex align-items-start" role="alert">
          <span className="me-2">⚠️</span>
          <div>
            <strong>Gagal memuat.</strong>
            <div className="small">{err}</div>
          </div>
        </div>
        <Link to="/" className="btn btn-outline-secondary">← Kembali</Link>
      </div>
    );

  if (!product)
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Produk tidak ditemukan.
        </div>
        <Link to="/" className="btn btn-outline-secondary">← Kembali</Link>
      </div>
    );

  const renderPrice = () => {
    if (Array.isArray(product.price)) {
      return (
        <ul className="small mb-0">
          {product.price.map((p, i) => (
            <li key={i}>🔹 {typeof p === "number" ? fmtIDR.format(p) : p}</li>
          ))}
        </ul>
      );
    }
    return (
      <div className="fw-semibold">
        {typeof product.price === "number" ? fmtIDR.format(product.price) : product.price}
      </div>
    );
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <Link to="/" className="btn btn-link px-0">← Kembali</Link>
        {product.category && (
          <span className="badge text-bg-light border">
            {product.category}
          </span>
        )}
      </div>

      <div className="row g-4 align-items-stretch">
        {/* Kolom detail */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="mb-1 text-truncate" title={product.name}>
                {product.name}
              </h4>
              {product.sku && (
                <small className="text-muted d-block">SKU: {product.sku}</small>
              )}

              <div className="mt-3">{renderPrice()}</div>

              {product.description && (
                <p className="small text-muted mt-3 mb-0" style={{ whiteSpace: "pre-line" }}>
                  {product.description}
                </p>
              )}

              {/* CTA optional */}
              <div className="mt-3 d-flex gap-2 flex-wrap">
                <a
                  className="btn btn-primary"
                  href={product?.whatsapp_link || `https://wa.me/6289515939531?text=${encodeURIComponent(`Halo, Saya ingin order ${product.name}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Pesan via WhatsApp
                </a>
                {product?.cta_link && (
                  <a className="btn btn-outline-secondary" href={product.cta_link} target="_blank" rel="noreferrer">
                    Kunjungi Link
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom testimoni */}
        <div className="col-12 col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Testimoni Produk Ini</h5>
            {testi.length > 0 && (
              <span className="badge text-bg-secondary">{testi.length}</span>
            )}
          </div>

          {testi.length === 0 ? (
            <div className="alert alert-light border small mb-0">
              Belum ada testimoni. Jadilah yang pertama memberikan ulasan!
            </div>
          ) : (
            <div className="row g-3">
              {testi.map((t) => (
                <div className="col-12 col-sm-6" key={t.id}>
                  <div className="card h-100 shadow-sm">
                    {t.photo_url ? (
                      <img
                        src={t.photo_url}
                        alt={t.name || "Foto testimoni"}
                        className="card-img-top"
                        style={{ height: 180, objectFit: "cover" }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="card-img-top bg-light d-flex align-items-center justify-content-center"
                        style={{ height: 180 }}
                      >
                        <span className="text-muted small">Tidak ada foto</span>
                      </div>
                    )}
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-1 text-truncate" title={t.name}>
                          {t.name || "Pengguna"}
                        </h6>
                        {t.rating && (
                          <span className="badge text-bg-success">
                            ⭐ {t.rating}
                          </span>
                        )}
                      </div>
                      <small className="text-muted">
                        {t.created_at
                          ? new Date(t.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </small>
                      {t.message && (
                        <p className="small mt-2 mb-0" style={{ whiteSpace: "pre-line" }}>
                          {t.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
