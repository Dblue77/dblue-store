import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import NavbarComp from "../components/AdminNavbar";
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

// Helper format IDR
const fIDR = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export default function AdminFinance() {
  // Filter tanggal
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState(firstDay.toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(today.toISOString().slice(0, 10));

  // Data
  const [totals, setTotals] = useState({
    total_income: 0,
    total_expense: 0,
    profit: 0,
  });
  const [storeBalance, setStoreBalance] = useState(0);
  const [pendingTopup, setPendingTopup] = useState(0);
  const [daily, setDaily] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    id: null,
    tanggal: dateTo,
    jenis: "income",
    income_category: "online",
    produk: "",
    nominal: "",
    catatan: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);

  const loadAll = async () => {
    setLoading(true);

    // Saldo & pending
    const [{ data: bal }, { data: pend }] = await Promise.all([
      supabase.from("v_store_balance").select("balance").single(),
      supabase.from("v_offline_pending_topup").select("pending_topup").single(),
    ]);
    if (bal) setStoreBalance(Number(bal.balance || 0));
    if (pend) setPendingTopup(Number(pend.pending_topup || 0));

    // Transaksi tanggal
    const { data: tx } = await supabase
      .from("finance_transactions")
      .select("*")
      .gte("tanggal", dateFrom)
      .lte("tanggal", dateTo)
      .order("tanggal", { ascending: false });
    setRows(tx || []);

    const { data: dailySums } = await supabase
      .from("finance_daily_sums")
      .select("*");
    const filtered = (dailySums || []).filter(
      (d) => d.tanggal >= dateFrom && d.tanggal <= dateTo
    );
    setDaily(filtered);

    // Totals
    const income = (tx || [])
      .filter((r) => r.jenis === "income")
      .reduce((a, b) => a + Number(b.nominal), 0);
    const expense = (tx || [])
      .filter((r) => r.jenis === "expense")
      .reduce((a, b) => a + Number(b.nominal), 0);
    setTotals({
      total_income: income,
      total_expense: expense,
      profit: income - expense,
    });

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [dateFrom, dateTo]);

  const resetForm = () => {
    setForm({ ...emptyForm, tanggal: dateTo });
    setIsEditing(false);
  };

  const onSubmit = async (e) => {
    e?.preventDefault?.();
    const isIncome = form.jenis === "income";

    const payload = {
      tanggal: form.tanggal,
      jenis: form.jenis,
      nominal: Number(form.nominal || 0),
      produk: isIncome ? form.produk || "-" : null,
      catatan: form.catatan || null,
      income_category: isIncome ? form.income_category : null,
    };

    if (!payload.tanggal || !payload.jenis || payload.nominal <= 0) {
      alert("Tanggal, jenis, dan nominal wajib diisi (nominal > 0).");
      return;
    }
    if (isIncome && !payload.income_category) {
      alert("Kategori pemasukan wajib diisi (Online/Offline).");
      return;
    }

    if (isEditing && form.id) {
      const { error } = await supabase
        .from("finance_transactions")
        .update(payload)
        .eq("id", form.id);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase
        .from("finance_transactions")
        .insert(payload);
      if (error) return alert(error.message);
    }
    resetForm();
    await loadAll();
  };

  const onEdit = (row) => {
    setIsEditing(true);
    setForm({
      id: row.id,
      tanggal: row.tanggal,
      jenis: row.jenis,
      income_category: row.income_category || "online",
      produk: row.produk || "",
      nominal: row.nominal,
      catatan: row.catatan || "",
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Hapus transaksi ini?")) return;
    const { error } = await supabase
      .from("finance_transactions")
      .delete()
      .eq("id", id);
    if (error) return alert(error.message);
    await loadAll();
  };

  const onTopUpRow = async (row) => {
    if (row.jenis !== "income" || row.income_category !== "offline") return;
    const remaining = Number(row.nominal) - Number(row.topped_up_amount || 0);
    if (remaining <= 0) return;

    if (!window.confirm(`Top up penuh ${fIDR(remaining)} ke Saldo Toko?`))
      return;

    const { error } = await supabase
      .from("finance_transactions")
      .update({
        topped_up_amount: Number(row.topped_up_amount || 0) + remaining,
      })
      .eq("id", row.id);
    if (error) return alert(error.message);
    await loadAll();
  };

  // TOP UP semua pending
  const onTopUpAll = async () => {
    if (pendingTopup <= 0) return;
    if (!window.confirm(`Top up ${fIDR(pendingTopup)} ke Saldo Toko?`)) return;

    const { data: pendings, error } = await supabase
      .from("finance_transactions")
      .select("id, nominal, topped_up_amount")
      .eq("jenis", "income")
      .eq("income_category", "offline");

    if (error) return alert(error.message);

    const updates = (pendings || [])
      .map((r) => ({
        id: r.id,
        newTopped:
          Number(r.topped_up_amount || 0) +
          Math.max(0, Number(r.nominal) - Number(r.topped_up_amount || 0)),
      }))
      .filter((u) => u.newTopped > 0);

    for (const u of updates) {
      const { error: e2 } = await supabase
        .from("finance_transactions")
        .update({ topped_up_amount: u.newTopped })
        .eq("id", u.id);

      if (e2) return alert(e2.message);
    }

    await loadAll();
  };

  const chartData = useMemo(() => {
    return (daily || []).map((d) => ({
      tanggal: d.tanggal,
      Pemasukan: Number(d.income_sum || 0),
      Pengeluaran: Number(d.expense_sum || 0),
    }));
  }, [daily]);

  return (
    <div style={{ background: "linear-gradient(180deg, #e7f4ff, #fff)" }}>
      <NavbarComp />
      <div className="container py-4">
        <h2 className="fw-bold mb-3">Pemasukan & Pengeluaran Dashboard</h2>

        {/* Cards ringkasan */}
        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted">Saldo Toko</div>
                <div className="fs-3 fw-bold">{fIDR(storeBalance)}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted">Perlu Top-Up</div>
                <div className="fs-3 fw-bold">{fIDR(pendingTopup)}</div>
                <button
                  className="btn btn-sm btn-primary mt-2"
                  disabled={pendingTopup <= 0 || loading}
                  onClick={onTopUpAll}
                >
                  Top Up
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted">Pemasukan</div>
                <div className="fs-3 fw-bold">{fIDR(totals.total_income)}</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted">Profit</div>
                <div
                  className={`fs-3 fw-bold ${
                    totals.profit >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {fIDR(totals.profit)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tanggal */}
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="row g-2 align-items-end">
              <div className="col-sm-3">
                <label className="form-label">Dari</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="col-sm-3">
                <label className="form-label">Sampai</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="col-sm-3">
                <button
                  className="btn btn-outline-secondary w-100 mt-3 mt-sm-0"
                  onClick={() => {
                    setDateFrom(firstDay.toISOString().slice(0, 10));
                    setDateTo(today.toISOString().slice(0, 10));
                  }}
                >
                  Reset ke Bulan Ini
                </button>
              </div>
              <div className="col-sm-3 text-sm-end">
                {loading ? (
                  <span className="text-muted">Memuat…</span>
                ) : (
                  <span className="text-success">Siap</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grafik */}
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <h6 className="mb-3">Grafik Pemasukan & Pengeluaran</h6>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <ComposedChart data={chartData} />
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Form Input */}
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <h6 className="mb-3">
              {isEditing ? "Edit Transaksi" : "Tambah Transaksi"}
            </h6>
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="form-label">Tanggal</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.tanggal}
                    onChange={(e) =>
                      setForm({ ...form, tanggal: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Jenis</label>
                  <select
                    className="form-select"
                    value={form.jenis}
                    onChange={(e) =>
                      setForm({ ...form, jenis: e.target.value })
                    }
                  >
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                </div>

                {/* Income only: kategori */}
                {form.jenis === "income" && (
                  <div className="col-md-2">
                    <label className="form-label">Kategori</label>
                    <select
                      className="form-select"
                      value={form.income_category}
                      onChange={(e) =>
                        setForm({ ...form, income_category: e.target.value })
                      }
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                )}

                {/* Income only: produk */}
                {form.jenis === "income" && (
                  <div className="col-md-4">
                    <label className="form-label">Nama Produk</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="cth: Netflix 1U / CapCut Premium"
                      value={form.produk}
                      onChange={(e) =>
                        setForm({ ...form, produk: e.target.value })
                      }
                      required
                    />
                  </div>
                )}

                {/* Expense: catatan */}
                {form.jenis === "expense" && (
                  <div className="col-md-6">
                    <label className="form-label">Catatan</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="cth: beli stok Apple Music"
                      value={form.catatan}
                      onChange={(e) =>
                        setForm({ ...form, catatan: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="col-md-2">
                  <label className="form-label">Nominal (IDR)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    pattern="\d*"
                    value={form.nominal}
                    onChange={(e) =>
                      setForm({ ...form, nominal: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="col-md-2 d-flex align-items-end gap-2">
                  <button type="submit" className="btn btn-primary w-100">
                    {isEditing ? "Simpan" : "Tambah"}
                  </button>
                </div>
                {isEditing && (
                  <div className="col-md-2 d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      onClick={resetForm}
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Tabel Transaksi */}
        <div className="card shadow-sm mb-5">
          <div className="card-body">
            <h6 className="mb-3">Transaksi</h6>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Produk / Catatan</th>
                    <th>Kategori</th>
                    <th className="text-end">Nominal</th>
                    <th className="text-end">Sisa Top-Up</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const isOfflineIncome =
                      r.jenis === "income" && r.income_category === "offline";
                    const remaining = isOfflineIncome
                      ? Number(r.nominal) - Number(r.topped_up_amount || 0)
                      : 0;
                    return (
                      <tr key={r.id}>
                        <td>{r.tanggal}</td>
                        <td
                          className={
                            r.jenis === "income"
                              ? "text-success"
                              : "text-danger"
                          }
                        >
                          {r.jenis === "income" ? "Pemasukan" : "Pengeluaran"}
                        </td>
                        <td>
                          {r.jenis === "income"
                            ? r.produk || "-"
                            : r.catatan || "-"}
                        </td>
                        <td>
                          {r.jenis === "income"
                            ? r.income_category || "-"
                            : "-"}
                        </td>
                        <td className="text-end">{fIDR(r.nominal)}</td>
                        <td className="text-end">
                          {isOfflineIncome ? fIDR(remaining) : "-"}
                        </td>
                        <td className="text-end">
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => onEdit(r)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDelete(r.id)}
                            >
                              Hapus
                            </button>
                            {isOfflineIncome && remaining > 0 && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => onTopUpRow(r)}
                              >
                                Top Up
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        Belum ada transaksi pada range tanggal ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Chart */
function ComposedChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tanggal" />
        <YAxis />
        <Tooltip formatter={(v) => fIDR(v)} />
        <Legend />
        <Bar dataKey="Pengeluaran" fill="#ef4444" />
        <Bar dataKey="Pemasukan" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
