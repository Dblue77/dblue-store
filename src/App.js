import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

// Komponen publik
import NavbarComp from "./components/Navbar";
import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import PriceCard from "./components/PriceCard";
import Footer from "./components/Footer";
import { supabase } from "./supabaseClient";

// Halaman publik tambahan
import Testimonials from "./pages/Testimonials";       // ✅ list testimoni publik
import OrderGuide from "./pages/OrderGuide";
import ProductDetail from "./pages/ProductDetail";     // ✅ detail produk + testimoni terkait

// Halaman admin
import AdminTestimonials from "./pages/AdminTestimonials"; // ✅ CRUD testimoni (admin)
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProductPage from "./pages/EditProductPage";

// ============================
// ✅ Halaman Publik (Pricelist)
// ============================
function PublicPricelist() {
  const [category, setCategory] = useState("premium");
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
    logVisit();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("pricelist")
      .select("*")
      .order("id", { ascending: true })
      .limit(500);
    if (!error) setData(data || []);
  };

  const logVisit = async () => {
    try {
      await supabase.from("visits").insert([
        {
          path: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          ip: null,
        },
      ]);
    } catch (err) {
      console.log("visit log err", err);
    }
  };

  const filteredData = data.filter(
    (item) =>
      !item.sold_out &&
      item.category === category &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "linear-gradient(180deg, #e7f4ff, #fff)" }}>
      <NavbarComp />
      <Header search={search} setSearch={setSearch} />
      <div className="container my-4">
        <CategoryBar category={category} setCategory={setCategory} />
        <div className="row g-4 mt-2">
          {filteredData.map((item) => (
            <motion.div
              key={item.id}
              className="col-lg-3 col-md-4 col-sm-6 col-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <PriceCard item={item} />
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ============================
// ✅ Routing Utama Aplikasi
// ============================
function App() {
  return (
    <Routes>
      {/* 🏠 Halaman Publik */}
      <Route path="/" element={<PublicPricelist />} />

      {/* ⭐ Testimoni Publik */}
      <Route path="/testimonials" element={<Testimonials />} />

      {/* 🧾 Cara Pemesanan */}
      <Route path="/order-guide" element={<OrderGuide />} />

      {/* 🛒 Detail Produk (dengan testimoni terkait) */}
      <Route path="/products/:id" element={<ProductDetail />} />  {/* ✅ NEW */}

      {/* 🧑‍💻 Admin Testimoni (CRUD) */}
      <Route
        path="/admin-testimonials"
        element={
          <ProtectedRoute>
            <AdminTestimonials />
          </ProtectedRoute>
        }
      />
      {/* alias opsional: /admin/testimonials → sama ke AdminTestimonials */}
      <Route
        path="/admin/testimonials"
        element={
          <ProtectedRoute>
            <AdminTestimonials />
          </ProtectedRoute>
        }
      />

      {/* 🔑 Login Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* 📊 Dashboard Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✏️ Halaman Edit Produk */}
      <Route path="/edit/:id" element={<EditProductPage />} />

      {/* 🚫 Redirect jika path tidak dikenal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
