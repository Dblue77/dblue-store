import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";
import NavbarComp from "../components/Navbar";
import Header from "../components/Header";
import CategoryBar from "../components/CategoryBar";
import PriceCard from "../components/PriceCard";
import Footer from "../components/Footer";

function Pricelist() {
  const [category, setCategory] = useState("sosmed");
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: priceList, error } = await supabase
        .from("pricelist") 
        .select("*")
        .eq("category", category);

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setData(priceList);
      }
      setLoading(false);
    };

    fetchData();
  }, [category]);

  // Filter berdasarkan pencarian
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "linear-gradient(180deg, #e7f4ff, #fff)" }}>
      <NavbarComp />
      <Header search={search} setSearch={setSearch} />

      <div className="container my-4">
        <CategoryBar category={category} setCategory={setCategory} />

        {loading ? (
          <div className="text-center py-5">⏳ Memuat data...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-5 text-secondary">Tidak ada data</div>
        ) : (
          <div className="row g-4 mt-2">
            {filteredData.map((item, i) => (
              <motion.div
                key={i}
                className="col-lg-3 col-md-4 col-sm-6 col-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PriceCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Pricelist;
