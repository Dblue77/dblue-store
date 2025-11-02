import React from "react";
import NavbarComp from "../components/Navbar";

export default function Reseller() {
  const WA_LINK =
    "https://wa.me/6289515939531?text=Halo%20Dblue%20Store,%20saya%20ingin%20jadi%20member%20PREFLIX";

  return (
    <div
      style={{ background: "linear-gradient(180deg, #e7f2ff 0%, #ffffff 40%)" }}
    >
      <NavbarComp />

      {/* HERO */}
      <section className="container py-5 text-center">
        <div className="d-flex flex-column align-items-center">
          <span className="badge rounded-pill text-bg-primary mb-3 px-3 py-2">
            Smart & Elite Digital Business
          </span>

          <h1
            className="fw-bold lh-sm mb-3"
            style={{ letterSpacing: ".2px", maxWidth: "720px" }}
          >
            Join <span className="text-primary">PREFLIX</span> Member Naik
            Kelas Jadi Pebisnis Digital
          </h1>

          <p className="text-secondary mb-4" style={{ maxWidth: "720px" }}>
            Mulai dengan modal terjangkau, nikmati harga reseller, materi
            promosi siap pakai, dan sistem yang rapi seperti startup modern.
            Fokus pada penjualan sisanya kami siapkan.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
            <a href={WA_LINK} className="btn btn-primary btn-lg px-4">
              Join Sekarang
            </a>
            <a href="#pricing" className="btn btn-outline-primary btn-lg px-4">
              Lihat Harga & Fasilitas
            </a>
          </div>

          <ul className="list-unstyled text-secondary small mb-0">
            <li className="d-flex justify-content-center align-items-center mb-1">
              <span className="me-2">✅</span> Akses ke produk digital
              high-demand
            </li>
            <li className="d-flex justify-content-center align-items-center mb-1">
              <span className="me-2">✅</span> Materi promosi & bimbingan
              singkat
            </li>
            <li className="d-flex justify-content-center align-items-center">
              <span className="me-2">✅</span> Sistem rapi & support responsif
            </li>
          </ul>
        </div>
      </section>

      {/* VALUE: Kenapa “Smart & Elite Business” */}
      <section className="container pb-4">
        <div className="text-center mb-4">
          <h3 className="fw-semibold">Kenapa PREFLIX Lebih Smart?</h3>
          <p className="text-secondary mb-0">
            Kami fokus pada hal yang benar-benar berdampak:{" "}
            <em>harga, sistem, dan dukungan</em>.
          </p>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <div className="display-6 mb-2">📊</div>
                <h5 className="card-title">Harga Reseller Kompetitif</h5>
                <p className="card-text text-secondary">
                  Akses harga spesial untuk produk high-demand. Margin sehat,
                  repeat order tinggi, dan cocok untuk berjualan.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <div className="display-6 mb-2">🧩</div>
                <h5 className="card-title">Sistem Rapi</h5>
                <p className="card-text text-secondary">
                  Alur kerja jelas, template promosi siap pakai, & dukungan
                  cepat. Kamu fokus jualan kami siapkan sistemnya.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <div className="display-6 mb-2">🤝</div>
                <h5 className="card-title">Support yang Peduli Hasil</h5>
                <p className="card-text text-secondary">
                  Bimbingan singkat, contoh caption, dan tips closing. Support
                  responsif tujuan kami: kamu cepat dapat pelanggan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFIT LIST */}
      <section className="container pb-4">
        <div className="row g-3">
          {[
            {
              t: "Produk Digital Populer",
              d: "Netflix, CapCut Pro, Apple Music, e-wallet, pulsa, dan lebih banyak lagi.",
            },
            {
              t: "Materi Promosi",
              d: "Template poster & caption siap pakai, tinggal upload dan jual.",
            },
            {
              t: "Tanpa Biaya Bulanan",
              d: "Cukup bayar sekali untuk join; fokus ke penjualan, bukan biaya rutin.",
            },
            {
              t: "Roadmap Jelas",
              d: "Langkah demi langkah untuk mulai jualan dari HP.",
            },
            {
              t: "Repeat Order Tinggi",
              d: "Produk berlangganan membuat pelanggan kembali.",
            },
            {
              t: "Komunitas & Support",
              d: "Kamu tidak jualan sendirian ada tempat bertanya & belajar.",
            },
          ].map((b, i) => (
            <div className="col-md-4" key={i}>
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h6 className="fw-semibold mb-1">{b.t}</h6>
                  <p className="text-secondary mb-0">{b.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container pb-5">
        <div className="text-center mb-3">
          <h3 className="fw-semibold">Harga Join Member PREFLIX</h3>
          <p className="text-secondary mb-0">
            Investasi ringan value jangka panjang.
          </p>
        </div>

        <div className="row justify-content-center g-3">
          <div className="col-md-6 col-lg-5">
            <div className="card h-100 shadow-sm text-center border-0">
              <div className="card-body p-4">
                <span className="badge text-bg-primary mb-2">Best Value</span>
                <div className="display-5 fw-bold mb-1">Rp55.000</div>
                <div className="text-secondary">
                  Bayar sekali • akses seumur hidup
                </div>
                <ul className="list-unstyled text-start mt-4 mb-0 small">
                  <li className="mb-2">✅ Harga khusus reseller</li>
                  <li className="mb-2">✅ Template & caption promosi</li>
                  <li className="mb-2">✅ Bimbingan singkat & support</li>
                  <li className="mb-2">✅ Produk digital high-demand</li>
                </ul>
              </div>
              <div className="card-footer bg-white border-0 pb-4">
                <a href={WA_LINK} className="btn btn-primary btn-lg w-75">
                  Join Sekarang
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container pb-5">
        <h4 className="fw-semibold mb-3">Pertanyaan Umum</h4>
        <div className="accordion" id="faq">
          <div className="accordion-item">
            <h2 className="accordion-header" id="q1">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#a1"
              >
                Ini bisnis apa?
              </button>
            </h2>
            <div
              id="a1"
              className="accordion-collapse collapse show"
              data-bs-parent="#faq"
            >
              <div className="accordion-body">
                Bisnis digital berbasis aplikasi & sistem. Kamu menjual
                layanan/akun digital populer dengan harga reseller, semuanya
                bisa dijalankan hanya dari HP.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="q2">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#a2"
              >
                Bagaimana cara join?
              </button>
            </h2>
            <div
              id="a2"
              className="accordion-collapse collapse"
              data-bs-parent="#faq"
            >
              <div className="accordion-body">
                Klik tombol <strong>Join Sekarang</strong>, lalu chat admin di
                WhatsApp. Pembayaran sekali (Rp55.000), akses fasilitas seumur
                hidup tanpa biaya bulanan/tahunan.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="q3">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#a3"
              >
                Saya pemula, bisa?
              </button>
            </h2>
            <div
              id="a3"
              className="accordion-collapse collapse"
              data-bs-parent="#faq"
            >
              <div className="accordion-body">
                Bisa. Kami sediakan panduan singkat, materi promosi, dan contoh
                caption untuk mulai cepat. Fokusmu tinggal posting & melayani
                pelanggan sistemnya sudah siap.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="q4">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#a4"
              >
                Produk yang dijual apa saja?
              </button>
            </h2>
            <div
              id="a4"
              className="accordion-collapse collapse"
              data-bs-parent="#faq"
            >
              <div className="accordion-body">
                Contoh: Netflix Premium, CapCut Pro, Apple Music, e-wallet,
                pulsa, dan layanan digital lain yang peminatnya tinggi. Kamu
                mendapatkan harga khusus member untuk semua itu.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA CLOSING */}
      <section className="container pb-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5 d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div className="mb-3 mb-md-0">
              <h4 className="fw-semibold mb-1">
                Siap naik kelas bareng PREFLIX?
              </h4>
              <p className="text-secondary mb-0">
                Mulai dari sekarang. Bangun penghasilan digital dengan sistem
                yang rapi.
              </p>
            </div>
            <a href={WA_LINK} className="btn btn-primary btn-lg px-4">
              Join Sekarang
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
