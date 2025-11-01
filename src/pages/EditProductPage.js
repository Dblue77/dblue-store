import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [errorMsg, setErrorMsg] = useState("");

  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORY_OPTIONS);
  const [form, setForm] = useState({
    name: "",
    category: "",
    priceText: "",
    logo: "",
    tncText: "", 
  });
  const [categoryCustom, setCategoryCustom] = useState("");

  useEffect(() => {
    if (!rowId) return;
    const ch = supabase
      .channel("realtime-pricelist-" + rowId)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pricelist", filter: `id=eq.${rowId}` },
        (payload) => {
          const p = payload?.new ?? {};
          setForm({
            name: p.name ?? "",
            category: p.category ?? "",
            priceText: arrayToTextarea(p.price),
            logo: p.logo ?? "",
            tncText: (p.tnc ?? ""),
          });
        }
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [rowId]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!rowId) return;
      setLoading(true);
      setErrorMsg("");

      const prodPromise = supabase
        .from("pricelist")
        .select("id,name,category,price,logo,tnc") 
        .eq("id", rowId)
        .maybeSingle();

      const catPromise = supabase
        .from("categories")
        .select("name")
        .order("name", { ascending: true })
        .then((res) => {
          if (res.error || !Array.isArray(res.data)) throw res.error || new Error("no categories");
          const names = res.data.map((c) => (typeof c.name === "string" ? c.name.trim() : "")).filter(Boolean);
          return names.length ? names : DEFAULT_CATEGORY_OPTIONS;
        })
        .catch(() => DEFAULT_CATEGORY_OPTIONS);

      const [prodRes, catList] = await Promise.all([prodPromise, catPromise]);

      if (!alive) return;

      setCategoryOptions(catList);

      if (prodRes.error) {
        setErrorMsg(prodRes.error.message || "Gagal memuat produk.");
      } else if (prodRes.data) {
        const p = prodRes.data;
        setForm({
          name: p.name ?? "",
          category: p.category ?? "",
          priceText: arrayToTextarea(p.price),
          logo: p.logo ?? "",
          tncText: p.tnc ?? "",
        });
        if (p.category && !catList.includes(p.category)) {
          setCategoryCustom(p.category);
        }
      } else {
        setErrorMsg("Produk tidak ditemukan.");
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const categorySelectValue =
    form.category
      ? (categoryOptions.includes(form.category) ? form.category : CUSTOM_SENTINEL)
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
    setSaving(true);
    setErrorMsg("");

    const finalCategory =
      categorySelectValue === CUSTOM_SENTINEL
        ? (categoryCustom || "").trim()
        : form.category;

    if (!form.name.trim()) {
      setErrorMsg("Nama produk wajib diisi.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: finalCategory || null,
      price: textareaToArray(form.priceText),
      logo: form.logo?.trim() || null,
      tnc: form.tncText?.trim() || null,
    };

    const { error } = await supabase.from("pricelist").update(payload).eq("id", rowId);

    setSaving(false);
    if (error) {
      setErrorMsg(error.message || "Gagal menyimpan perubahan.");
      return;
    }
    navigate("/admin");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: 640 }}>
        <h4 className="fw-semibold mb-3 text-center">Edit Produk</h4>

        {errorMsg ? <div className="alert alert-danger">{errorMsg}</div> : null}

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
                onChange={handleField}
                className="form-control"
                placeholder="Contoh: Instagram Followers"
              />
            </div>

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

            <div className="mb-3">
              <label className="form-label">Daftar Harga</label>
              <textarea
                name="priceText"
                value={form.priceText}
                onChange={handleField}
                className="form-control"
                rows={6}
                placeholder={`Contoh:\n100 Followers : 5k\n200 Followers : 10k\n300 Followers : 14k`}
              />
            </div>

            {/* S&K Produk */}
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

            <div className="d-flex justify-content-between">
              <button className="btn btn-secondary" onClick={() => navigate("/admin")} disabled={saving}>
                Batal
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
