import React from "react";
import NavbarComp from "../components/Navbar";
import Footer from "../components/Footer";

export default function Reseller() {
  return (
    <div style={{ background: "linear-gradient(180deg, #e7f4ff, #fff)" }}>
      <NavbarComp />

      {/* Hero */}
      <section className="container py-5">
        <div className="text-center">
          <h1 className="fw-bold mb-2">Join Member PREFLIX</h1>
          <p className="text-muted mb-4">
            Gabung sekarang, nikmati harga spesial, materi promosi siap pakai,
            dan support.
          </p>
        </div>
      </section>

      {/* Benefit */}
      <section className="container pb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Harga Reseller</h5>
                <p className="card-text">
                  Harga khusus member dengan setengah harga dari harga normal.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Produk Digital</h5>
                <p className="card-text">
                  Netflix, CapCut Premium, Apple Music, dan layanan digital lain
                  yang permintaannya tinggi.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Support & Materi</h5>
                <p className="card-text">
                  Template poster, caption, dan bimbingan singkat cara cepat
                  dapat pelanggan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Paket contoh (statis) */}
      <section className="container pb-5">
        <h4 className="fw-semibold mb-3 text-center">
          Harga Join Member PREFLIX
        </h4>
        <div className="row g-3">
          <div className="col-md-15">
            <div className="card h-100 shadow-sm text-center border-primary">
              <div className="card-body">
                <p className="display-6 mb-0">Rp55K</p>
                <small className="text-muted">
                  Hanya dengan 55k bisa menghasilkan keuntungan yang lebih besar
                </small>
                <ul className="list-unstyled mt-3 mb-0">
                  <li>Harga Reseller</li>
                  <li>Template promosi</li>
                  <li>Caption promosi</li>
                  <li>Bimbingan agar cepat dapat pelanggan</li>
                </ul>
              </div>
              <div className="card-footer bg-white border-0">
                <a
                  className="btn btn-primary w-50"
                  href="https://wa.me/6289515939531?text=Halo%20Dblue%20Store,%20saya%20ingin%20jadi%20member%20PREFLIX"
                >
                  Join Sekarang
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container pb-5">
        <h4 className="fw-semibold mb-3">FAQ</h4>
        <div className="accordion" id="faq">
          <div className="accordion-item">
            <h2 className="accordion-header" id="q1">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#a1"
              >
                Kak, ini bisnis apa sih?
              </button>
            </h2>
            <div
              id="a1"
              className="accordion-collapse collapse show"
              data-bs-parent="#faq"
            >
              <div className="accordion-body">
                Ini bisnis digital ya kak 💻 Bisnis yang udah punya 1 aplikasi
                resmi & lengkap — semua fitur dan transaksi bisa dari HP aja 📱
                Jadi bukan jual produk fisik, tapi sistem kerja digital yang
                bisa dikerjain kapan aja dan di mana aja 🏠
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
                Kak, kalau mau join gimana caranya?
              </button>
            </h2>
            <div
              id="a2"
              className="accordion-collapse collapse"
              data-bs-parent="#faq"
            >
              <div className="accordion-body">
                Cara joinnya gampang banget kak 🙌 Cukup modal 1x seumur hidup
                aja 55k, kamu udah bisa dapet semua fasilitas ini: ✅ Akses ke 8
                bisnis digital sekaligus ✅ Aplikasi resmi PREFLIX (fitur
                lengkap) ✅ Full bimbingan & grup support aktif ✅ Materi
                promosi siap pakai ✅ Bisa dijalankan dari HP aja ✅ Gak ada
                biaya bulanan / tahunan Cukup bayar sekali, bisa jalanin
                bisnisnya selamanya ✨
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
                Kak, aku masih pemula. Bisa gak ya?
              </button>
            </h2>
            <div
              id="a3"
              className="accordion-collapse collapse"
              data-bs-parent="#faq"
            >
              <div className="accordion-body">
                Bisa banget kak! Kita siap bantu kamu dari nol sampai bisa
                jualan lho 💪 Kamu bakal dapet bimbingan singkat cara cepat
                dapat pelanggan, plus template poster dan caption promosi yang
                siap pakai 📝 Jadi gak perlu pusing mikirin desain atau
                kata-kata promosi deh!
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
                Kak, ini bisnisnya jualan apa aja?
              </button>
            </h2>
            <div
              id="a4"
              className="accordion-collapse collapse"
              data-bs-parent="#faq"
            >
              <div className="accordion-body">
                Kamu bakal jualin produk digital populer yang banyak, mulai dari
                aplikasi premium, SMM panel, E-Wallet, Pulsa, dan masih banyak
                lagi. Produk-produk itu di jual dengan harga reseller yang jauh
                lebih murah dari harga normal, jadi kamu bisa dapet untung
                lumayan tiap kali ada yang beli lewat kamu!
              </div>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
