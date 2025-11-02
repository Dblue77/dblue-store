import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { supabase } from "../supabaseClient";

const DEFAULT_CATEGORY_OPTIONS = ["sosmed", "premium", "pulsa", "ewallet"];
const CUSTOM_SENTINEL = "__custom__";

const textareaToArray = (s) =>
  (s || "")
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

const arrayToTextarea = (arr) => (Array.isArray(arr) ? arr.join("\n") : "");

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const rowId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState(
    DEFAULT_CATEGORY_OPTIONS
  );
  const [form, setForm] = useState({
    name: "",
    category: "",
    priceText: "",
    logo: "",
    tncText: "",
    // stok khusus premium
    stock: 0,
  });
  const [categoryCustom, setCategoryCustom] = useState("");

  // Realtime update
  useEffect(() => {
    if (!rowId) return;
    const ch = supabase
      .channel("realtime-pricelist-" + rowId)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pricelist",
          filter: `id=eq.${rowId}`,
        },
        (payload) => {
          const p = payload?.new ?? {};
          setForm((prev) => ({
            ...prev,
            name: p.name ?? "",
            category: p.category ?? "",
            priceText: arrayToTextarea(p.price),
            logo: p.logo ?? "",
            tncText: p.tnc ?? "",
            stock: Number(p.stock ?? 0),
          }));
          toast.info("Produk diupdate (realtime) ✨");
        }
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [rowId]);

  // Initial load
  useEffect(() => {
    let alive = true;

    async function load() {
      if (!rowId) return;
      setLoading(true);

      const prodPromise = supabase
        .from("pricelist")
        .select("id,name,category,price,logo,tnc,stock")
        .eq("id", rowId)
        .maybeSingle();

      const catPromise = supabase
        .from("categories")
        .select("name")
        .order("name", { ascending: true })
        .then((res) => {
          if (res.error || !Array.isArray(res.data))
            throw res.error || new Error("no categories");
          const names = res.data
            .map((c) =>
              typeof c.name === "string" ? c.name.trim() : ""
            )
            .filter(Boolean);
          return names.length ? names : DEFAULT_CATEGORY_OPTIONS;
        })
        .catch(() => DEFAULT_CATEGORY_OPTIONS);

      const [prodRes, catList] = await Promise.all([prodPromise, catPromise]);

      if (!alive) return;

      setCategoryOptions(catList);

      if (prodRes.error) {
        toast.error(`Gagal memuat produk: ${prodRes.error.message}`);
      } else if (prodRes.data) {
        const p = prodRes.data;
        setForm({
          name: p.name ?? "",
          category: p.category ?? "",
          priceText: arrayToTextarea(p.price),
          logo: p.logo ?? "",
          tncText: p.tnc ?? "",
          stock: Number(p.stock ?? 0),
        });
        if (p.category && !catList.includes(p.category)) {
          setCategoryCustom(p.category);
        }
      } else {
        toast.error("Produk tidak ditemukan.");
      }

      setLoading(false);
    }

    load();
    return () => {
      alive = false;
    };
  }, [rowId]);

  const handleField = (e) => {
    const { name, value } = e.target;
    if (name === "stock") {
      const n = Math.max(0, Number(value ?? 0));
      setForm((prev) => ({ ...prev, stock: n }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Nilai select kategori (support custom)
  const categorySelectValue = form.category
    ? categoryOptions.includes(form.category)
      ? form.category
      : CUSTOM_SENTINEL
    : "";

  const onCategorySelect = (e) => {
    const val = e.target.value;
    if (val === CUSTOM_SENTINEL) {
      if (!categoryCustom) setCategoryCustom("");
    } else {
      setForm((prev) => ({ ...prev, category: val }));
      setCategoryCustom("");
    }
  };

  const handleSave = async () => {
    // Validasi dasar
    const nameTrim = form.name.trim();
    if (!nameTrim) {
      toast.error("Nama produk wajib diisi.");
      return;
    }

    setSaving(true);

    const finalCategory =
      categorySelectValue === CUSTOM_SENTINEL
        ? (categoryCustom || "").trim()
        : form.category;

    const isPremium = (finalCategory || "").toLowerCase() === "premium";

    // payload dasar
    const payloadBase = {
      name: nameTrim,
      category: finalCategory || null,
      price: textareaToArray(form.priceText),
      logo: form.logo?.trim() || null,
      tnc: form.tncText?.trim() || null,
    };

    // untuk kategori premium: kirim stok + sold_out auto
    const payload = isPremium
      ? {
          ...payloadBase,
          stock: Number.isFinite(Number(form.stock)) ? Number(form.stock) : 0,
          sold_out: Number(form.stock) === 0, // auto → 0 stok = sold out
        }
      : payloadBase;

    const { error } = await supabase
      .from("pricelist")
      .update(payload)
      .eq("id", rowId);

    setSaving(false);

    if (error) {
      toast.error(`Save failed: ${error.message}`);
      return;
    }
    toast.success("Changes saved successfully! ✅");
    // kecilkan jeda biar toast sempat muncul
    setTimeout(() => navigate("/admin"), 300);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      {/* Sonner toaster */}
      <Toaster richColors position="top-right" />

      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: 640 }}>
        <h4 className="fw-semibold mb-3 text-center">Edit Produk</h4>

        {loading ? (
          <p className="text-center m-0">Loading...</p>
        ) : (
          <>
            {/* Nama Produk */}
            <div className="mb-3">
              <label className="form-label">Nama Produk</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleField}
                className="form-control"
                placeholder="Contoh: Netflix 1U"
              />
            </div>

            {/* Kategori */}
            <div className="mb-3">
              <label className="form-label">Kategori</label>
              <select
                value={categorySelectValue}
                onChange={onCategorySelect}
                className="form-select"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                {!categoryOptions.includes(form.category) && form.category && (
                  <option value={CUSTOM_SENTINEL}>Custom: {form.category}</option>
                )}
                {/* Opsional: izinkan buat kategori custom baru */}
                {categorySelectValue === "" && (
                  <option value="">-- pilih kategori --</option>
                )}
              </select>

              {categorySelectValue === CUSTOM_SENTINEL && (
                <input
                  type="text"
                  className="form-control mt-2"
                  placeholder="Isi kategori custom"
                  value={categoryCustom}
                  onChange={(e) => setCategoryCustom(e.target.value)}
                />
              )}
            </div>

            {/* Stok: hanya untuk kategori premium */}
            {(form.category || "").toLowerCase() === "premium" && (
              <div className="mb-3">
                <label className="form-label">Stok Produk</label>
                <input
                  type="number"
                  min={0}
                  name="stock"
                  value={form.stock}
                  onChange={handleField}
                  className="form-control"
                  placeholder="0"
                />
              </div>
            )}

            {/* Daftar Harga */}
            <div className="mb-3">
              <label className="form-label">Daftar Harga</label>
              <textarea
                name="priceText"
                value={form.priceText}
                onChange={handleField}
                className="form-control"
                rows={6}
                placeholder={`Contoh:\n1 Bulan : 25k\n2 Bulan : 45k`}
              />
            </div>

            {/* S&K */}
            <div className="mb-3">
              <label className="form-label">Syarat & Ketentuan (S&K)</label>
              <textarea
                name="tncText"
                value={form.tncText}
                onChange={handleField}
                className="form-control"
                rows={6}
              />
            </div>

            {/* Aksi */}
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/admin")}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
