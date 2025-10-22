import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import AdminNavbar from "../components/AdminNavbar";
import { useNavigate } from "react-router-dom";

export default function AdminTestimonials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    id: null,
    name: "",
    message: "",
    product_id: "",
    photo_url: "",
    photo_path: "",
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchList();
    const sub = supabase
      .channel("public:testimonials")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "testimonials" },
        fetchList
      )
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  async function fetchList() {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setList(data || []);
    setLoading(false);
  }

  function resetForm() {
    setForm({
      id: null,
      name: "",
      message: "",
      product_id: "",
      photo_url: "",
      photo_path: "",
    });
    setFile(null);
  }

  async function uploadToBucket(f) {
    if (!f) return { url: "", path: "", error: null };
    if (f.size > 5 * 1024 * 1024) {
      return { error: new Error("Ukuran file > 5MB, kecilkan dulu.") };
    }
    const ext = (f.name?.split(".").pop() || "bin").toLowerCase();
    const filename = `photos/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from("testimonials")
      .upload(filename, f, {
        cacheControl: "3600",
        upsert: true, // hindari 409
        contentType: f.type || undefined,
      });
    if (error) return { error };
    const { data: pub } = supabase.storage.from("testimonials").getPublicUrl(data.path);
    return { url: pub.publicUrl, path: data.path, error: null };
  }

  async function removeFromBucket(path) {
    if (!path) return;
    await supabase.storage.from("testimonials").remove([path]);
  }

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      return alert("Nama & pesan wajib diisi.");
    }
    setSaving(true);
    try {
      let uploaded;
      if (file) {
        uploaded = await uploadToBucket(file);
        if (uploaded?.error) throw uploaded.error;
      }
      const payload = {
        name: form.name,
        message: form.message,
        product_id: form.product_id ? Number(form.product_id) : null,
        ...(uploaded?.url && {
          photo_url: uploaded.url,
          photo_path: uploaded.path,
        }),
      };

      if (form.id) {
        // jika ganti file, hapus file lama
        if (uploaded?.path && form.photo_path && form.photo_path !== uploaded.path) {
          await removeFromBucket(form.photo_path);
        }
        const { error } = await supabase.from("testimonials").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
      }

      await fetchList();
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err?.message || "Gagal menyimpan testimoni.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm("Hapus testimoni ini?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", item.id);
    if (!error) {
      if (item.photo_path) await removeFromBucket(item.photo_path);
      setList((prev) => prev.filter((x) => x.id !== item.id));
    }
  }

  // dipakai navbar
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filtered = q
    ? list.filter((t) => (t.name + " " + t.message).toLowerCase().includes(q.toLowerCase()))
    : list;

  return (
    <>
      <AdminNavbar onSignOut={handleSignOut} />

      <div className="container py-4">
        <h4 className="mb-3">Admin — Testimoni</h4>

        {/* Form */}
        <form onSubmit={save} className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-2 align-items-center">
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Nama"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  className="form-control"
                  placeholder="Pesan"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="ID Produk (opsional)"
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <input
                  type="file"
                  className="form-control"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {form.id ? "Update" : "Simpan"}
              </button>
              {form.id && (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Reset
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Filter */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Daftar Testimoni</h6>
          <input
            className="form-control"
            style={{ width: 240 }}
            placeholder="Cari…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* List */}
        {loading ? (
          <div>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-muted">Belum ada testimoni.</div>
        ) : (
          <div className="row g-3">
            {filtered.map((t) => (
              <div className="col-md-6 col-lg-4" key={t.id}>
                <div className="card h-100 shadow-sm">
                  {t.photo_url && (
                    <img
                      src={t.photo_url}
                      alt={t.name}
                      className="card-img-top"
                      style={{ height: 160, objectFit: "cover" }}
                      loading="lazy"
                    />
                  )}
                  <div className="card-body d-flex flex-column">
                    <div>
                      <h6 className="mb-1">{t.name}</h6>
                      <small className="text-muted">
                        {new Date(t.created_at).toLocaleDateString()}
                        {t.product_id ? ` • Produk #${t.product_id}` : ""}
                      </small>
                      <p className="small mt-2">{t.message}</p>
                    </div>
                    <div className="mt-auto d-flex gap-2">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => {
                          setForm({
                            id: t.id,
                            name: t.name || "",
                            message: t.message || "",
                            product_id: t.product_id || "",
                            photo_url: t.photo_url || "",
                            photo_path: t.photo_path || "",
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Edit
                      </button>
                      <button className="btn btn-sm btn-dark" onClick={() => handleDelete(t)}>
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
    </>
  );
}
