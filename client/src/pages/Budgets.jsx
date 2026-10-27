import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { createBudget, deleteBudget, getBudgets, getTransactions, updateBudget } from "../services/api";

const blank = { category: "", amount: "" };
const money = n => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export default function Budgets() {
  const [budgets, setBudgets] = useState([]); const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(blank); const [editingId, setEditingId] = useState(null); const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const load = async () => { try { setError(""); const [b, t] = await Promise.all([getBudgets(), getTransactions()]); setBudgets(b.budgets || []); setTransactions(t.transactions || []); } catch (e) { setError(e.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const spentByCategory = useMemo(() => {
  const now = new Date();

  return transactions
    .filter((t) => {
      const date = new Date(t.date);

      return (
        t.type === "expense" &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((map, t) => {
      const key = t.category.trim().toLowerCase();
      map[key] = (map[key] || 0) + Number(t.amount);
      return map;
    }, {});
}, [transactions]);
  const spentTotal = budgets.reduce((sum, b) => sum + (spentByCategory[b.category.toLowerCase()] || 0), 0);
  const budgetTotal = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const reset = () => { setForm(blank); setEditingId(null); setShowForm(false); };
  const edit = b => { setForm({ category: b.category, amount: String(b.amount) }); setEditingId(b.id); setShowForm(true); };
  const submit = async e => { e.preventDefault(); setSaving(true); setError(""); try { const payload = { category: form.category.trim(), amount: Number(form.amount) }; if (editingId) await updateBudget(editingId, payload); else await createBudget(payload); reset(); await load(); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  const remove = async id => { if (!window.confirm("Delete this budget?")) return; try { await deleteBudget(id); await load(); } catch (e) { setError(e.message); } };
  return <div className="dashboard-layout"><Sidebar /><main className="dashboard-main">
    <div className="page-heading"><div><span className="eyebrow">PLAN WITH INTENTION</span><h1>Budgets</h1><p className="muted">Set category limits and keep your spending on track.</p></div><button className="button-primary" onClick={() => showForm ? reset() : setShowForm(true)}>{showForm ? "Close form" : "+ Create budget"}</button></div>
    <div className="summary-grid compact-grid"><article className="summary-card"><p>Total planned</p><h2>{money(budgetTotal)}</h2></article><article className="summary-card"><p>Spent in budget categories</p><h2 className="negative">{money(spentTotal)}</h2></article><article className="summary-card"><p>Remaining</p><h2 className={budgetTotal - spentTotal < 0 ? "negative" : "positive"}>{money(budgetTotal - spentTotal)}</h2></article><article className="summary-card"><p>Active budgets</p><h2>{budgets.length}</h2></article></div>
    {showForm && <section className="panel form-panel"><h2>{editingId ? "Edit budget" : "Create budget"}</h2><form className="data-form two-col-form" onSubmit={submit}><label>Category<input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Food" required maxLength={40} /></label><label>Monthly limit (₹)<input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></label><div className="form-actions"><button className="button-primary" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create budget"}</button><button type="button" className="button-secondary" onClick={reset}>Cancel</button></div></form></section>}
    <section className="panel"><div className="section-heading"><div><h2>Your category budgets</h2><p className="muted">Progress is calculated from all recorded expenses in each category.</p></div></div>
      {error && <p className="form-error page-error">{error}</p>}{loading ? <p className="empty-state">Loading budgets…</p> : budgets.length === 0 ? <div className="empty-state"><strong>No budgets yet</strong><p>Create your first category budget to start tracking spending.</p></div> : <div className="budget-grid">{budgets.map(b => { const spent = spentByCategory[b.category.toLowerCase()] || 0; const limit = Number(b.amount); const pct = limit ? Math.min((spent / limit) * 100, 100) : 0; const over = spent > limit; return <article className="budget-card" key={b.id}><div className="budget-card-top"><div><span className="category-icon">▤</span><h3>{b.category}</h3></div><div className="row-actions"><button className="text-button" onClick={() => edit(b)}>Edit</button><button className="text-button danger-text" onClick={() => remove(b.id)}>Delete</button></div></div><div className="budget-amounts"><strong>{money(spent)}</strong><span>of {money(limit)}</span></div><div className="progress-track"><div className={`progress-fill ${over ? "over" : ""}`} style={{ width: `${pct}%` }} /></div><div className="budget-foot"><span>{Math.round((spent / (limit || 1)) * 100)}% used</span><span className={over ? "negative" : "positive"}>{over ? `${money(spent - limit)} over` : `${money(limit - spent)} left`}</span></div></article>; })}</div>}
    </section>
  </main></div>;
}
