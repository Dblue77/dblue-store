import React, { useEffect, useState, useMemo } from "react";
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
import AdminNavbar from "../components/AdminNavbar";

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "sosmed",
    priceText: "",
    stock: 0,
    tncText: "",
    photoUrl: "",
  });
  const [prodFile, setProdFile] = useState(null);
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

    return () => {
      supabase.removeChannel(pricelistSub);
    };
  }, []);

  async function uploadProductImage(file) {
    if (!file) return { url: "", path: "", error: null };
    const ext = (file.name?.split(".").pop() || "bin").toLowerCase();
    const filename = `photos/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    if (file.size > 5 * 1024 * 1024) {
      return { error: new Error("Ukuran file > 5MB, kecilkan dulu.") };
    }

    const { data, error } = await supabase.storage
      .from("products")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "application/octet-stream",
      });

    if (error) {
      console.error("Storage upload error:", error);
      return { error };
    }

    const { data: pub } = supabase.storage
      .from("products")
      .getPublicUrl(data.path);

    return { url: pub.publicUrl, path: data.path, error: null };
  }

  async function removeProductImage(path) {
    if (!path) return;
    await supabase.storage.from("products").remove([path]);
  }

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

    let uploaded;
    if (prodFile) {
      uploaded = await uploadProductImage(prodFile);
      if (uploaded?.error) return alert(uploaded.error.message);
    }

    const payload = {
      name: newItem.name,
      category: newItem.category,
      price: priceArr,
      logo: logoDefault,
      stock: stockVal,
      sold_out: newItem.category === "premium" ? stockVal <= 0 : false,
      tnc: newItem.tncText || null,
      photo_url: uploaded?.url || null,
      photo_path: uploaded?.path || null,
    };

    const { error } = await supabase.from("pricelist").insert([payload]);
    if (error) return alert(error.message);

    setNewItem({
      name: "",
      category: "sosmed",
      priceText: "",
      stock: 0,
      tncText: "",
      photoUrl: "",
    });
    setProdFile(null);
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

    const tncDefault = item.tnc ?? "";
    const tncPrompt = prompt(
      "S&K (multiline, kosongkan jika tidak):",
      tncDefault
    );
    if (tncPrompt === null) return;
    const tncText = tncPrompt;

    let stock = item.stock;
    if (category === "premium") {
      const stokPrompt = prompt("Stok:", item.stock || 0);
      if (stokPrompt === null) return;
      stock = parseInt(stokPrompt) || 0;
    }

    const priceArr = priceText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const soldOut = category === "premium" ? stock <= 0 : item.sold_out;

    const { error } = await supabase
      .from("pricelist")
      .update({
        name,
        category,
        price: priceArr,
        stock,
        sold_out: soldOut,
        tnc: tncText || null,
      })
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

    const item = items.find((i) => i.id === id);
    if (item?.photo_path) {
      await removeProductImage(item.photo_path);
    }

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

  const counts = useMemo(() => {
    return {
      premium: items.filter((i) => i.category === "premium").length,
      sosmed: items.filter((i) => i.category === "sosmed").length,
      ewallet: items.filter((i) => i.category === "ewallet").length,
      pulsa: items.filter((i) => i.category === "pulsa").length,
      total: items.length,
    };
  }, [items]);

  return (
    <>
      {/* Navbar Admin  */}
      <AdminNavbar onSignOut={handleSignOut} />

      {/* === Konten === */}
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
          <h2 className="fw-bold mb-3">Admin Dashboard</h2>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={fetchAll}>
              Refresh
            </button>
          </div>
        </div>

        {/* Stat Cards: Jumlah Produk per Kategori */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted">App Premium</div>
                <div className="fs-3 fw-bold">{counts.premium}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted">Sosmed</div>
                <div className="fs-3 fw-bold">{counts.sosmed}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted">E-Wallet</div>
                <div className="fs-3 fw-bold">{counts.ewallet}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted">Pulsa</div>
                <div className="fs-3 fw-bold">{counts.pulsa}</div>
              </div>
            </div>
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

              {/* Upload Foto Produk */}
              <div className="col-md-4">
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setProdFile(f);
                    if (f) {
                      const url = URL.createObjectURL(f);
                      setNewItem((prev) => ({ ...prev, photoUrl: url }));
                    } else {
                      setNewItem((prev) => ({ ...prev, photoUrl: "" }));
                    }
                  }}
                />
                {newItem.photoUrl ? (
                  <div className="mt-2">
                    <img
                      src={newItem.photoUrl}
                      alt="Preview"
                      style={{ height: 56, borderRadius: 8 }}
                    />
                  </div>
                ) : null}
              </div>

              {/* S&K */}
              <div className="col-12">
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Syarat & Ketentuan"
                  value={newItem.tncText}
                  onChange={(e) =>
                    setNewItem({ ...newItem, tncText: e.target.value })
                  }
                />
              </div>

              <div className="col-md-2">
                <button className="btn btn-primary w-100" onClick={addItem}>
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter dan Search Produk */}
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
                        src={it.photo_url || it.logo || logoDefault}
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
                      {Array.isArray(it.price) ? (
                        it.price.map((p, i) => <li key={i}>🔹 {p}</li>)
                      ) : (
                        <li>🔹 {it.price}</li>
                      )}
                    </ul>

                    <div className="d-flex flex-wrap gap-2 mt-auto">
                      <button
                        className="btn btn-sm btn-warning flex-grow-1"
                        onClick={() => navigate(`/edit/${it.id}`)}
                      >
                        Edit Produk
                      </button>

                      {/* Ganti Foto cepat */}
                      <label className="btn btn-sm btn-info flex-grow-1 mb-0">
                        Ganti Foto
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const up = await uploadProductImage(file);
                            if (up?.error) return alert(up.error.message);
                            // hapus foto lama jika ada
                            if (it.photo_path && it.photo_path !== up.path) {
                              await removeProductImage(it.photo_path);
                            }
                            const { error } = await supabase
                              .from("pricelist")
                              .update({
                                photo_url: up.url,
                                photo_path: up.path,
                              })
                              .eq("id", it.id);
                            if (error) alert(error.message);
                            fetchAll();
                          }}
                        />
                      </label>

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
    </>
  );
}
