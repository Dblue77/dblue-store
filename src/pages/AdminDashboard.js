import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
} from "recharts";
import logoDefault from "../assets/logo.png";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "sosmed",
    priceText: "",
    stock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
    fetchVisits();
    const pricelistSub = supabase
      .channel("public:pricelist")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pricelist" },
        () => fetchAll()
      )
      .subscribe();
    return () => supabase.removeChannel(pricelistSub);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pricelist")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setItems(data || []);
    setLoading(false);
  };

  const fetchVisits = async () => {
    const { data, error } = await supabase.rpc("get_visit_counts_by_day", {
      days: 14,
    });
    if (!error) setVisits(data || []);
  };

  const addItem = async () => {
    if (!newItem.name.trim()) return alert("Nama produk wajib diisi!");
    const priceArr = newItem.priceText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const stockVal =
      newItem.category === "premium" ? parseInt(newItem.stock) || 0 : null;

    const payload = {
      name: newItem.name,
      category: newItem.category,
      price: priceArr,
      logo: logoDefault,
      stock: stockVal,
      sold_out: newItem.category === "premium" ? stockVal <= 0 : false,
    };

    const { error } = await supabase.from("pricelist").insert([payload]);
    if (error) return alert(error.message);
    setNewItem({ name: "", category: "sosmed", priceText: "", stock: 0 });
    fetchAll();
  };

  const editItem = async (id) => {
    const item = items.find((i) => i.id === id);
    const name = prompt("Nama produk:", item.name);
    if (name === null) return;
    const category = prompt("Kategori:", item.category);
    if (category === null) return;
    const priceText = prompt(
      "Harga (pisahkan koma):",
      Array.isArray(item.price) ? item.price.join(", ") : item.price
    );
    if (priceText === null) return;
    let stock = item.stock;
    if (category === "premium") {
      const stokPrompt = prompt("Stok:", item.stock || 0);
      if (stokPrompt === null) return;
      stock = parseInt(stokPrompt) || 0;
    }

    const priceArr = priceText.split(",").map((s) => s.trim()).filter(Boolean);
    const soldOut = category === "premium" ? stock <= 0 : item.sold_out;

    const { error } = await supabase
      .from("pricelist")
      .update({ name, category, price: priceArr, stock, sold_out: soldOut })
      .eq("id", id);
    if (!error) fetchAll();
  };

  const toggleSoldOut = async (id) => {
    const item = items.find((i) => i.id === id);
    const { error } = await supabase
      .from("pricelist")
      .update({ sold_out: !item.sold_out })
      .eq("id", id);
    if (!error) fetchAll();
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    const { error } = await supabase.from("pricelist").delete().eq("id", id);
    if (!error) fetchAll();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filteredItems = items.filter((it) => {
    const matchCategory =
      selectedCategory === "all" || it.category === selectedCategory;
    const matchSearch = it.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Admin Dashboard</h3>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={fetchAll}>
            Refresh
          </button>
          <button className="btn btn-danger" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>

      {/* Tambah Produk */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="fw-semibold mb-3">Tambah Produk</h5>
          <div className="row g-2 align-items-center">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Nama produk"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              >
                <option value="sosmed">Sosmed</option>
                <option value="premium">App Premium</option>
                <option value="pulsa">Pulsa</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="Harga (pisahkan koma)"
                value={newItem.priceText}
                onChange={(e) =>
                  setNewItem({ ...newItem, priceText: e.target.value })
                }
              />
            </div>
            {newItem.category === "premium" && (
              <div className="col-md-2">
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Stok"
                  value={newItem.stock}
                  onChange={(e) =>
                    setNewItem({ ...newItem, stock: e.target.value })
                  }
                />
              </div>
            )}
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={addItem}>
                Tambah
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter dan Search */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <select
            className="form-select"
            style={{ width: "180px" }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Semua Kategori</option>
            <option value="sosmed">Sosmed</option>
            <option value="premium">App Premium</option>
            <option value="pulsa">Pulsa</option>
            <option value="ewallet">E-Wallet</option>
          </select>
        </div>
        <input
          type="text"
          className="form-control"
          style={{ width: "220px" }}
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Daftar Produk */}
      <div className="mb-4">
        <h5 className="fw-semibold mb-3">Daftar Produk</h5>
        {loading ? (
          <div>Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-muted">Tidak ada produk ditemukan.</div>
        ) : (
          <div className="row g-3">
            {filteredItems.map((it) => (
              <div className="col-md-4 col-lg-3" key={it.id}>
                <div className="card shadow-sm p-3 h-100">
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={it.logo || logoDefault}
                      alt={it.name}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        objectFit: "cover",
                        marginRight: 10,
                      }}
                    />
                    <div>
                      <h6 className="mb-0">{it.name}</h6>
                      <small className="text-muted">{it.category}</small>
                      {it.category === "premium" && (
                        <div className="text-info small">
                          Stok: {it.stock ?? 0}
                        </div>
                      )}
                    </div>
                  </div>
                  <ul className="small mb-2">
                    {Array.isArray(it.price)
                      ? it.price.map((p, i) => <li key={i}>🔹 {p}</li>)
                      : <li>🔹 {it.price}</li>}
                  </ul>
                  <div className="d-flex flex-wrap gap-2 mt-auto">
                    <button
                      className="btn btn-sm btn-warning flex-grow-1"
                      onClick={() => navigate(`/edit/${it.id}`)}
                    >
                      Edit Produk
                    </button>
                    <button
                      className={`btn btn-sm ${
                        it.sold_out ? "btn-secondary" : "btn-danger"
                      } flex-grow-1`}
                      onClick={() => toggleSoldOut(it.id)}
                    >
                      {it.sold_out ? "Aktifkan" : "Sold Out"}
                    </button>
                    <button
                      className="btn btn-sm btn-dark flex-grow-1"
                      onClick={() => deleteItem(it.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Traffic Chart */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-semibold mb-3">Traffic (14 Hari Terakhir)</h5>
          {visits.length === 0 ? (
            <div className="text-muted">Belum ada data traffic.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#007bff"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: "#007bff",
                    stroke: "#fff",
                    strokeWidth: 1,
                  }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  fill="rgba(0,123,255,0.2)"
                  stroke="none"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
