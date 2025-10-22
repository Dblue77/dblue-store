import React from "react";

export default function OrderGuide() {
  return (
    <div className="container py-4">
      <h4 className="mb-3">Cara Pemesanan</h4>
      <ol className="small">
        <li>Pilih produk pada halaman utama.</li>
        <li>Hubungi admin/lanjut ke checkout sesuai instruksi.</li>
        <li>Lakukan pembayaran sesuai metode yang tersedia.</li>
        <li>Order diproses, bukti/akun akan dikirim.</li>
      </ol>
      <div className="alert alert-info mt-3">
        Butuh bantuan? Hubungi kami via kontak yang tertera di footer.
      </div>
    </div>
  );
}
