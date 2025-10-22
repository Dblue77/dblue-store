import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";

function Header({ search, setSearch }) {
  // ===== Content & typing effect =====
  const fullText = "DBLUE STORE — OFFICIAL PRICE LIST";
  const [displayedText, setDisplayedText] = useState("");
  const [i, setI] = useState(0);
  const prefersReduced = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    []
  );
  const typingSpeed = 55; // ms per char
  const cursorRef = useRef(null);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayedText(fullText);
      return;
    }
    if (i >= fullText.length) return;
    const t = setTimeout(() => {
      setDisplayedText((prev) => prev + fullText[i]);
      setI((x) => x + 1);
    }, typingSpeed);
    return () => clearTimeout(t);
  }, [i, fullText, prefersReduced]);

  // ===== Handlers =====
  const onChange = (e) => setSearch?.(e.target.value);

  return (
    <header className="py-4 py-md-5 bg-gradient position-relative overflow-hidden">
      {/* ===== Helmet (SEO) ===== */}
      <Helmet>
        <title>Dblue Store - Official Price List</title>
        <meta
          name="description"
          content="Dblue Store - Top up termurah & terpercaya: suntik semua sosial media, app premium, e-wallet, dan pulsa. Pembayaran via QRIS & E-Wallet."
        />
        <meta
          name="keywords"
          content="Dblue Store, app premium, suntik sosmed, top up e-wallet, pulsa, QRIS, e-wallet, harga followers, harga like"
        />
        <meta name="author" content="Dblue Store" />
        {/* Open Graph */}
        <meta property="og:title" content="Dblue Store - Official Price List" />
        <meta
          property="og:description"
          content="Top up termurah & terpercaya. Payment via All E-Wallet / QRIS."
        />
        <meta property="og:type" content="website" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Dblue Store - Official Price List" />
        <meta
          name="twitter:description"
          content="Top up termurah & terpercaya. Payment via All E-Wallet / QRIS."
        />
      </Helmet>

      <div className="container">
        {/* Title */}
        <h1 className="display-title text-center fw-bold mb-2 mb-md-3">
          <span className="title-gradient">{displayedText}</span>
          <span
            ref={cursorRef}
            className={`title-cursor ${i >= fullText.length || prefersReduced ? "invisible" : ""}`}
            aria-hidden="true"
          >
            |
          </span>
        </h1>

        {/* Sub tagline */}
        <p className="text-center text-muted mb-3 mb-md-4">
          💳 Payment via <strong>All E-Wallet</strong> / <strong>QRIS</strong>
        </p>

        {/* Search */}
        <div className="d-flex justify-content-center">
          <div className="search-wrap shadow-sm">
            <span className="search-icon" aria-hidden="true">
              {/* magnifier icon (SVG) */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              type="text"
              className="form-control search-input"
              placeholder="Cari produk…"
              value={search}
              onChange={onChange}
              aria-label="Cari produk"
            />
          </div>
        </div>
      </div>

      {/* ===== Styles (scoped to header) ===== */}
      <style>{`
        .bg-gradient {
          background: linear-gradient(180deg, #e7f4ff 0%, #ffffff 100%);
        }

        .display-title {
          font-size: clamp(1.25rem, 2.5vw + 1rem, 2.25rem);
          line-height: 1.15;
          letter-spacing: 0.3px;
        }

        .title-gradient {
          background: linear-gradient(90deg, #0d6efd, #00c2ff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 0 0 rgba(0,0,0,0); /* fix antialias */
        }

        .title-cursor {
          display: inline-block;
          width: 2px;
          margin-left: 4px;
          color: #0d6efd;
          animation: blink 0.85s step-start infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }

        .search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          width: min(720px, 100%);
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid rgba(13,110,253,0.15);
        }
        .search-wrap:focus-within {
          box-shadow: 0 0 0 4px rgba(13,110,253,0.08);
          border-color: rgba(13,110,253,0.35);
        }

        .search-icon {
          color: #6c757d;
          display: grid;
          place-items: center;
        }

        .search-input {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          padding: 8px 4px;
          font-size: 0.95rem;
          background: transparent;
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .title-cursor { animation: none; }
        }
      `}</style>
    </header>
  );
}

export default Header;
