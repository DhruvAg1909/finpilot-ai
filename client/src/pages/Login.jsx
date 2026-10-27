import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try { await login(form.email.trim(), form.password); navigate("/", { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return <main className="auth-page"><section className="auth-card">
    <div className="brand-mark">FP</div><p className="eyebrow">PERSONAL FINANCE, MADE CLEAR</p>
    <h1>Welcome back</h1><p className="muted">Sign in to continue to your financial workspace.</p>
    <form onSubmit={submit} className="form-stack">
      <label>Email address<input type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button-primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className="auth-switch">New to FinPilot? <Link to="/register">Create an account</Link></p>
  </section></main>;
}
