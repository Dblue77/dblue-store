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
import AdminNavbar from "../components/AdminNavbar";

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

  // Testimoni (CRUD)
  const [testimonials, setTestimonials] = useState([]);
  const [tLoading, setTLoading] = useState(true);
  const [tSearch, setTSearch] = useState("");
  const [tForm, setTForm] = useState({
    id: null,
    name: "",
    message: "",
    product_id: "",
    photo_url: "",
    photo_path: "",
  });
  const [tFile, setTFile] = useState(null);
  const [tSaving, setTSaving] = useState(false);

  useEffect(() => {
    fetchAll();
    fetchVisits();
    fetchTestimonials();

    const pricelistSub = supabase
      .channel("public:pricelist")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pricelist" },
        () => fetchAll()
      )
      .subscribe();

    const testiSub = supabase
      .channel("public:testimonials")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "testimonials" },
        () => fetchTestimonials()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pricelistSub);
      supabase.removeChannel(testiSub);
    };
  }, []);

  // Produk functions
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

    const priceArr = priceText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
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

    // Testimoni functions
  async function fetchTestimonials() {
    setTLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setTestimonials(data || []);
    setTLoading(false);
  }

  function resetTForm() {
    setTForm({
      id: null,
      name: "",
      message: "",
      product_id: "",
      photo_url: "",
      photo_path: "",
    });
    setTFile(null);
  }

  async function uploadToBucket(file) {
    if (!file) return { url: "", path: "", error: null };
    const ext = (file.name?.split(".").pop() || "bin").toLowerCase();
    const filename = `photos/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    if (file.size > 5 * 1024 * 1024) {
      return { error: new Error("Ukuran file > 5MB, kecilkan dulu.") };
    }

    const { data, error } = await supabase.storage
      .from("testimonials")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || undefined,
      });

    if (error) {
      console.error("Upload Storage error:", error);
      return { error };
    }

    const { data: pub } = supabase.storage
      .from("testimonials")
      .getPublicUrl(data.path);
    return { url: pub.publicUrl, path: data.path, error: null };
  }

  async function removeFromBucket(path) {
    if (!path) return;
    const { error } = await supabase.storage
      .from("testimonials")
      .remove([path]);
    if (error) console.error("Remove file error:", error);
  }

  async function saveTestimonial(e) {
    e.preventDefault();
    if (!tForm.name.trim() || !tForm.message.trim()) {
      return alert("Nama dan pesan wajib diisi.");
    }

    setTSaving(true);
    try {
      let uploaded;
      if (tFile) {
        uploaded = await uploadToBucket(tFile);
        if (uploaded?.error) throw uploaded.error;
      }

      const payload = {
        name: tForm.name,
        message: tForm.message,
        product_id: tForm.product_id ? Number(tForm.product_id) : null,
        ...(uploaded?.url && {
          photo_url: uploaded.url,
          photo_path: uploaded.path,
        }),
      };

      if (tForm.id) {
        if (
          uploaded?.path &&
          tForm.photo_path &&
          tForm.photo_path !== uploaded.path
        ) {
          await removeFromBucket(tForm.photo_path);
        }
        const { error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", tForm.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
      }

      await fetchTestimonials();
      resetTForm();
    } catch (err) {
      console.error("Save Testimonial error:", err);
      alert(err?.message || "Gagal menyimpan testimoni.");
    } finally {
      setTSaving(false);
    }
  }

  function handleEditTestimonial(item) {
    setTForm({
      id: item.id,
      name: item.name || "",
      message: item.message || "",
      product_id: item.product_id || "",
      photo_url: item.photo_url || "",
      photo_path: item.photo_path || "",
    });
    setTFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteTestimonial(item) {
    if (!window.confirm("Hapus testimoni ini?")) return;
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", item.id);
    if (!error) {
      if (item.photo_path) await removeFromBucket(item.photo_path);
      setTestimonials((prev) => prev.filter((x) => x.id !== item.id));
    }
  }

  const filteredTestimonials = testimonials.filter((t) =>
    (t.name + " " + t.message).toLowerCase().includes(tSearch.toLowerCase())
  );

  return (
    <>
      {/* === Navbar Admin (dari components) === */}
      <AdminNavbar onSignOut={handleSignOut} />

      {/* === Konten === */}
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Admin Dashboard</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={fetchAll}>
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

        {/* === CRUD TESTIMONI === */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-semibold mb-3">Kelola Testimoni</h5>

            {/* Form */}
            <form onSubmit={saveTestimonial}>
              <div className="row g-2">
                <div className="col-md-3">
                  <input
                    className="form-control"
                    placeholder="Nama pelanggan"
                    value={tForm.name}
                    onChange={(e) =>
                      setTForm({ ...tForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    className="form-control"
                    placeholder="Pesan / testimoni"
                    value={tForm.message}
                    onChange={(e) =>
                      setTForm({ ...tForm, message: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ID Produk (opsional)"
                    value={tForm.product_id}
                    onChange={(e) =>
                      setTForm({ ...tForm, product_id: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => setTFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={tSaving}
                  >
                    {tForm.id ? "Update" : "Simpan"}
                  </button>
                  {tForm.id && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetTForm}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Search */}
            <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
              <h6 className="mb-0">Daftar Testimoni</h6>
              <input
                className="form-control"
                style={{ width: 240 }}
                placeholder="Cari nama/pesan..."
                value={tSearch}
                onChange={(e) => setTSearch(e.target.value)}
              />
            </div>

            {/* List */}
            {tLoading ? (
              <div>Loading...</div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="text-muted">Belum ada testimoni.</div>
            ) : (
              <div className="row g-3">
                {filteredTestimonials.map((t) => (
                  <div className="col-md-6 col-lg-4" key={t.id}>
                    <div className="card h-100 shadow-sm">
                      {t.photo_url && (
                        <img
                          src={t.photo_url}
                          alt={t.name}
                          className="card-img-top"
                          style={{ objectFit: "cover", height: 720 }}
                          loading="lazy"
                        />
                      )}
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{t.name}</h6>
                            <small className="text-muted">
                              {new Date(t.created_at).toLocaleDateString()}
                              {t.product_id ? ` • Produk #${t.product_id}` : ""}
                            </small>
                          </div>
                        </div>
                        <p className="small mt-2 mb-3">{t.message}</p>
                        <div className="mt-auto d-flex gap-2">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEditTestimonial(t)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-dark"
                            onClick={() => handleDeleteTestimonial(t)}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                    dot={{ r: 4, fill: "#007bff", stroke: "#fff", strokeWidth: 1 }}
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
