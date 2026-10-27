import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from "../services/api";

const emptyForm = { title: "", amount: "", category: "", type: "expense", date: new Date().toISOString().slice(0, 10) };
const money = value => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try { setError(""); const data = await getTransactions(); setTransactions(data.transactions || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const categories = useMemo(() => [...new Set(transactions.map(t => t.category).filter(Boolean))].sort(), [transactions]);
  const filtered = useMemo(() => transactions.filter(t => {
    const q = search.trim().toLowerCase();
    const date = new Date(t.date).toISOString().slice(0, 10);
    return (!q || `${t.title} ${t.category}`.toLowerCase().includes(q)) &&
      (typeFilter === "all" || t.type === typeFilter) &&
      (categoryFilter === "all" || t.category === categoryFilter) &&
      (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
  }), [transactions, search, typeFilter, categoryFilter, fromDate, toDate]);

  const beginEdit = transaction => {
    setEditingId(transaction.id);
    setForm({ title: transaction.title, amount: String(transaction.amount), category: transaction.category, type: transaction.type, date: new Date(transaction.date).toISOString().slice(0, 10) });
    setShowForm(true); setError("");
  };
  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };
  const submit = async event => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, amount: Number(form.amount), date: new Date(`${form.date}T12:00:00`).toISOString() };
      if (editingId) await updateTransaction(editingId, payload); else await createTransaction(payload);
      resetForm(); await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  const remove = async id => {
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;
    try { setError(""); await deleteTransaction(id); await load(); }
    catch (e) { setError(e.message); }
  };

  const totalIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  return <div className="dashboard-layout"><Sidebar /><main className="dashboard-main">
    <div className="page-heading"><div><span className="eyebrow">YOUR MONEY, ORGANIZED</span><h1>Transactions</h1><p className="muted">Track every rupee coming in and going out.</p></div><button className="button-primary" onClick={() => { if (showForm) resetForm(); else { setEditingId(null); setForm(emptyForm); setShowForm(true); } }}>{showForm ? "Close form" : "+ Add transaction"}</button></div>
    <div className="summary-grid compact-grid"><article className="summary-card"><p>Filtered income</p><h2 className="positive">{money(totalIncome)}</h2></article><article className="summary-card"><p>Filtered expenses</p><h2 className="negative">{money(totalExpense)}</h2></article><article className="summary-card"><p>Net cash flow</p><h2>{money(totalIncome - totalExpense)}</h2></article><article className="summary-card"><p>Transactions</p><h2>{filtered.length}</h2></article></div>
    {showForm && <section className="panel form-panel"><div className="section-heading"><div><h2>{editingId ? "Edit transaction" : "Add transaction"}</h2><p className="muted">Enter the details below.</p></div></div><form className="data-form" onSubmit={submit}>
      <label>Title<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Monthly salary" required maxLength={80} /></label>
      <label>Amount (₹)<input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></label>
      <label>Category<input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Food" required maxLength={40} /></label>
      <label>Type<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="expense">Expense</option><option value="income">Income</option></select></label>
      <label>Date<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></label>
      <div className="form-actions"><button className="button-primary" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Add transaction"}</button><button type="button" className="button-secondary" onClick={resetForm}>Cancel</button></div>
    </form></section>}
    <section className="panel"><div className="section-heading"><div><h2>All transactions</h2><p className="muted">Search and filter your activity.</p></div><span className="count-pill">{filtered.length} records</span></div>
      <div className="filter-row"><input aria-label="Search transactions" placeholder="Search title or category…" value={search} onChange={e => setSearch(e.target.value)} /><select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="all">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select><label>From<input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></label><label>To<input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></label></div>
      {error && <p className="form-error page-error">{error}</p>}{loading ? <p className="empty-state">Loading transactions…</p> : filtered.length === 0 ? <p className="empty-state">No transactions match these filters.</p> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Transaction</th><th>Category</th><th>Date</th><th>Type</th><th className="align-right">Amount</th><th>Actions</th></tr></thead><tbody>{filtered.map(t => <tr key={t.id}><td><strong>{t.title}</strong></td><td>{t.category}</td><td>{new Date(t.date).toLocaleDateString("en-IN")}</td><td><span className={`status-tag ${t.type}`}>{t.type}</span></td><td className={`align-right amount ${t.type}`}>{t.type === "income" ? "+" : "−"}{money(t.amount)}</td><td><div className="row-actions"><button className="text-button" onClick={() => beginEdit(t)}>Edit</button><button className="text-button danger-text" onClick={() => remove(t.id)}>Delete</button></div></td></tr>)}</tbody></table></div>}
    </section>
  </main></div>;
}
