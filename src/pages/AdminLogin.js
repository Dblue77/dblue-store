import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    navigate("/admin");
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h3 className="mb-3">Admin Login</h3>
      <form onSubmit={handleLogin}>
        <input className="form-control mb-2" placeholder="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="form-control mb-2" placeholder="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div className="d-flex gap-2">
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
      <p className="text-muted mt-3 small">
        Note: admin user must be added to <code>admins</code> table via Supabase SQL editor.
      </p>
    </div>
  );
}
