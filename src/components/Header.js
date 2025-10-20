import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

function Header({ search, setSearch }) {
  const fullText = "DBLUE STORE - OFFICIAL PRICE LIST";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + fullText[index]);
        setIndex(index + 1);
      }, 70);
      return () => clearTimeout(timeout);
    }
  }, [index]);

  return (
    <header className="text-center py-4">
      <Helmet>
        <title>Dblue Store - Official Price List</title>
        <meta
          name="description"
          content="Dblue Store - Tempat top up termurah dan terpercaya untuk suntik all sosial media, app premium, E-Wallet, dan Pulsa. Pembayaran via QRIS & E-Wallet."
        />
        <meta
          name="keywords"
          content="Dblue Store, app premium, suntik all sosmed, topup E-Wallet, pulsa, QRIS, E-Wallet, harga followers murah, harga like murah"
        />
        <meta name="author" content="Dblue Store" />
      </Helmet>

      <h2 className="fw-bold text-primary typing-text">
        {displayedText}
        <span className="cursor">|</span>
      </h2>

      <p className="text-muted">💳 Payment via All E-Wallet / QRIS</p>
      <div className="d-flex justify-content-center mt-3">
        <input
          type="text"
          className="form-control w-50 shadow-sm"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Styling efek ketikan */}
      <style>{`
        .typing-text {
          display: inline-block;
          font-family: "Poppins", sans-serif;
        }
        .cursor {
          display: inline-block;
          width: 2px;
          background-color: #0d6efd;
          animation: blink 0.8s infinite;
          margin-left: 2px;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </header>
  );
}

export default Header;
