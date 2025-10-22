import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import NavbarComp from "../components/Navbar";
import Header from "../components/Header";
import CategoryBar from "../components/CategoryBar";
import Footer from "../components/Footer";

export default function PublicPricelist() {
  const [data, setData] = useState([]);
  const [category, setCategory] = useState("sosmed");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
    logVisit();
  }, []);

  const fetchData = async () => {
    const { data: fetchedData, error } = await supabase
      .from("pricelist")
      .select("*")
      .eq("sold_out", false) 
      .order("id", { ascending: true })
      .limit(500);

    if (!error) setData(fetchedData || []);
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
          {filteredData.map((it) => (
            <motion.div
              key={it.id}
              className="col-lg-3 col-md-4 col-sm-6 col-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="card text-center border-0 shadow-sm p-3 rounded-4 h-100">
                <div className="d-flex align-items-center mb-2">
                  {it.logo && (
                    <img
                      src={it.logo}
                      alt={it.name}
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 6,
                        marginRight: 10,
                      }}
                    />
                  )}
                  <div>
                    <h6 className="mb-0">{it.name}</h6>
                    <small className="text-muted">{it.category}</small>
                  </div>
                </div>
                <ul className="list-unstyled text-start text-secondary small">
                  {Array.isArray(it.price)
                    ? it.price.map((p, i) => <li key={i}>🔹 {p}</li>)
                    : <li>🔹 {it.price}</li>}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
