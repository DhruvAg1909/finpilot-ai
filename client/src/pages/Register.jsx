import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault(); setError("");
    if (form.password.length < 8) return setError("Use a password with at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try { await register(form.name.trim(), form.email.trim(), form.password); navigate("/", { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return <main className="auth-page"><section className="auth-card">
    <div className="brand-mark">FP</div><p className="eyebrow">START YOUR FINANCIAL JOURNEY</p>
    <h1>Create your account</h1><p className="muted">Set up your personal FinPilot workspace.</p>
    <form onSubmit={submit} className="form-stack">
      <label>Full name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="name" required /></label>
      <label>Email address<input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="email" required /></label>
      <label>Password<input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} autoComplete="new-password" minLength={8} required /></label>
      <label>Confirm password<input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} autoComplete="new-password" required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button-primary" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
    </form>
    <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
  </section></main>;
}
