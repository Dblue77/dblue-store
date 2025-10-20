import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";


export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    sold_out: false,
  });

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pricelist")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) setForm(data);
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("pricelist")
      .update(form)
      .eq("id", id);
    setLoading(false);
    if (!error) navigate("/admin");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: 600 }}>
        <h4 className="fw-semibold mb-3 text-center">✏️ Edit Produk</h4>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <>
            <div className="mb-3">
              <label className="form-label">Nama Produk</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Harga</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Kategori</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Stok</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-check mb-3">
              <input
                type="checkbox"
                name="sold_out"
                checked={form.sold_out}
                onChange={handleChange}
                className="form-check-input"
                id="soldOutCheck"
              />
              <label className="form-check-label" htmlFor="soldOutCheck">
                Tandai Sold Out
              </label>
            </div>

            <div className="d-flex justify-content-between">
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/admin")}
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
