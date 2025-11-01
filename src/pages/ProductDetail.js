import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // === Accent (biru langit)
  const ACCENT = {
    base: "#48A7FF",
    dark: "#1E8BFF",
    light: "#EAF4FF",
    border: "#CFE6FF",
  };

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

        const [{ data: prod, error: e1 }] = await Promise.all([
          supabase.from("pricelist").select("*").eq("id", id).single(),
        ]);
        if (e1) throw new Error(e1.message);

        if (isMounted) {
          setProduct(prod || null);
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

  // --- UI helpers
  const HeaderBack = () => (
    <Link
      to="/"
      className="text-decoration-none"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: ACCENT.light,
        border: `1px solid ${ACCENT.border}`,
        color: "#0F172A",
        padding: "8px 14px",
        borderRadius: 999,
        fontWeight: 500,
        transition: "all .2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F4F9FF")}
      onMouseLeave={(e) => (e.currentTarget.style.background = ACCENT.light)}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>←</span>
      <span>Kembali</span>
    </Link>
  );

  const renderPrice = () => {
    if (!product) return null;
    if (Array.isArray(product.price)) {
      return (
        <ul className="list-unstyled mb-0" style={{ lineHeight: 1.6 }}>
          {product.price.map((p, i) => (
            <li key={i}>• {typeof p === "number" ? fmtIDR.format(p) : p}</li>
          ))}
        </ul>
      );
    }
    return (
      <div className="fw-semibold fs-4">
        {typeof product.price === "number"
          ? fmtIDR.format(product.price)
          : product.price}
      </div>
    );
  };

  const renderTnC = () => {
    const raw = (product?.tnc || "").trim();
    if (!raw) return null;
    const lines = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const hasTitle = lines.length > 0 && /^[A-Za-z0-9]/.test(lines[0]);
    const title = hasTitle ? lines[0] : "Syarat & Ketentuan";
    const points = hasTitle ? lines.slice(1) : lines;

    return (
      <section className="mt-5">
        <div
          className="rounded-4"
          style={{
            border: `1px solid ${ACCENT.border}`,
            background: "#fff",
          }}
        >
          <div
            className="px-4 py-3 rounded-top-4"
            style={{
              background: ACCENT.light,
              borderBottom: `1px solid ${ACCENT.border}`,
            }}
          >
            <h5 className="mb-0" style={{ color: "#0F172A" }}>
              {title}
            </h5>
          </div>
          <div className="px-4 py-4">
            <ul className="mb-0 small" style={{ paddingLeft: 18 }}>
              {points.map((line, i) => (
                <li key={i} className="mb-2" style={{ whiteSpace: "pre-wrap" }}>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  };

  if (loading)
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center text-muted">
        Memuat…
      </div>
    );

  if (err)
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block">{err}</div>
        <div className="mt-3">
          <HeaderBack />
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning d-inline-block">
          Produk tidak ditemukan.
        </div>
        <div className="mt-3">
          <HeaderBack />
        </div>
      </div>
    );

  return (
    <div className="container py-5" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <HeaderBack />
        {product.category && (
          <span
            className="badge rounded-pill"
            style={{
              background: ACCENT.light,
              color: "#0F172A",
              border: `1px solid ${ACCENT.border}`,
              padding: "10px 14px",
              fontWeight: 600,
              letterSpacing: 0.2,
            }}
          >
            {product.category}
          </span>
        )}
      </div>

      {/* Main: kiri (produk) | kanan (cara pesan + tombol) */}
      <div className="row g-4">
        {/* Kiri: detail produk */}
        <div className="col-12 col-lg-7">
          <section
            className="rounded-4 p-4"
            style={{
              background: "#fff",
              border: "1px solid #EEF2F7",
            }}
          >
            {product.photo_url && (
              <div className="mb-3 text-center">
                <img
                  src={product.photo_url}
                  alt={product.name}
                  loading="lazy"
                  style={{
                    width: 180, 
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 24, 
                    border: "1px solid #EEF2F7",
                    background: "#F6FAFF",
                    display: "inline-block",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  }}
                />
              </div>
            )}

            <h2 className="mb-1" style={{ color: "#0F172A" }}>
              {product.name}
            </h2>
            {product.sku && (
              <small className="text-muted d-block mb-3">
                SKU: {product.sku}
              </small>
            )}

            {/* Harga */}
            <div className="mb-3">{renderPrice()}</div>

            {/* Deskripsi */}
            {product.description && (
              <p
                className="text-secondary mb-0"
                style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}
              >
                {product.description}
              </p>
            )}
          </section>
        </div>

        {/* Kanan: cara pesan + tombol (sticky) */}
        <div className="col-12 col-lg-5">
          <aside
            className="rounded-4 p-4"
            style={{
              position: "sticky",
              top: 24,
              background: "#fff",
              border: `1px solid ${ACCENT.border}`,
            }}
          >
            <h5 className="mb-3" style={{ color: "#0F172A" }}>
              Cara Pesan
            </h5>
            <ol className="small mb-4 ps-3" style={{ lineHeight: 1.7 }}>
              <li>Pilih paket/opsi harga yang diinginkan.</li>
              <li>Tekan tombol “Pesan via WhatsApp”.</li>
              <li>Isi format pesanan sesuai instruksi.</li>
              <li>Lakukan pembayaran sesuai nominal.</li>
              <li>Pesanan akan diproses otomatis/manual.</li>
            </ol>

            <div className="d-grid gap-2">
              <a
                className="btn rounded-3 py-2"
                href={
                  product?.whatsapp_link ||
                  `https://wa.me/6289515939531?text=${encodeURIComponent(
                    `Halo, Saya ingin order ${product.name}`
                  )}`
                }
                target="_blank"
                rel="noreferrer"
                style={{
                  background: ACCENT.base,
                  border: `1px solid ${ACCENT.dark}`,
                  color: "#fff",
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              >
                Pesan via WhatsApp
              </a>

              {product?.cta_link && (
                <a
                  className="btn btn-light rounded-3 py-2"
                  href={product.cta_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: "#fff",
                    border: `1px solid ${ACCENT.border}`,
                    color: "#0F172A",
                    fontWeight: 600,
                  }}
                >
                  Kunjungi Link
                </a>
              )}
            </div>

            <div className="mt-3 small text-muted">
              * Respon cepat pada jam kerja. Waktu proses tergantung jenis
              layanan.
            </div>
          </aside>
        </div>
      </div>

      {/* S&K */}
      {renderTnC()}
    </div>
  );
}
