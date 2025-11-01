import React, { useEffect } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

// Komponen publik
import NavbarComp from "./components/Navbar";
import Header from "./components/Header";
import CategoryBar from "./components/CategoryBar";
import PriceCard from "./components/PriceCard";
import Footer from "./components/Footer";
import { supabase } from "./supabaseClient";

// Halaman publik
import Testimonials from "./pages/Testimonials";
import OrderGuide from "./pages/OrderGuide";
import ProductDetail from "./pages/ProductDetail";
import Reseller from "./pages/Reseller";

// Halaman admin
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProductPage from "./pages/EditProductPage";
import AdminFinance from "./pages/AdminFinance";

function TitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    let title = "Dblue Store";

    if (pathname === "/") title = "Dblue Store – Toko Digital Murah";
    else if (pathname.startsWith("/products"))
      title = "Detail Produk · Dblue Store";
    else if (pathname.startsWith("/testimonials"))
      title = "Testimoni Pelanggan · Dblue Store";
    else if (pathname.startsWith("/order-guide"))
      title = "Cara Pemesanan · Dblue Store";
    else if (pathname.startsWith("/admin/login"))
      title = "Login Admin · Dblue Store";
    else if (pathname.startsWith("/admin/testimonials"))
      title = "Kelola Testimoni · Dblue Store";
    else if (pathname.startsWith("/admin")) title = "Admin Panel · Dblue Store";
    else if (pathname.startsWith("/edit")) title = "Edit Produk · Dblue Store";

    document.title = title;
  }, [pathname]);

  return <title>Dblue Store</title>;
}

function PublicPricelist() {
  const [category, setCategory] = React.useState("premium");
  const [search, setSearch] = React.useState("");
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
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

function App() {
  return (
    <>
      <TitleManager /> {/* auto title global */}
      <link rel="icon" type="image/png" href="../src/assets/logo.png" />
      <Routes>
        <Route path="/" element={<PublicPricelist />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/order-guide" element={<OrderGuide />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/reseller" element={<Reseller />} />
        <Route
          path="/admin-testimonials"
          element={
            <ProtectedRoute>
              <AdminTestimonials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/testimonials"
          element={
            <ProtectedRoute>
              <AdminTestimonials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/finance"
          element={
            <ProtectedRoute>
              <AdminFinance />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/edit/:id" element={<EditProductPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
