
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  createGoal,
  deleteGoal,
  getGoals,
  updateGoal,
} from "../services/api";

const blank = {
  title: "",
  targetAmount: "",
  savedAmount: "0",
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [contributionGoal, setContributionGoal] = useState(null);
  const [contribution, setContribution] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await getGoals();
      setGoals(data.goals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const targetTotal = goals.reduce(
    (sum, goal) => sum + Number(goal.targetAmount),
    0
  );

  const savedTotal = goals.reduce(
    (sum, goal) => sum + Number(goal.savedAmount),
    0
  );

  const completedGoals = goals.filter(
    (goal) => Number(goal.savedAmount) >= Number(goal.targetAmount)
  ).length;

  const reset = () => {
    setForm(blank);
    setEditingId(null);
    setShowForm(false);
  };

  const edit = (goal) => {
    setForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      savedAmount: String(goal.savedAmount),
    });

    setEditingId(goal.id);
    setShowForm(true);
    setContributionGoal(null);
  };

  const submit = async (event) => {
    event.preventDefault();

    const target = Number(form.targetAmount);
    const saved = Number(form.savedAmount);

    if (
      !form.title.trim() ||
      !Number.isFinite(target) ||
      !Number.isFinite(saved) ||
      target <= 0 ||
      saved < 0 ||
      saved > target
    ) {
      setError("Please enter valid goal details and amounts.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        targetAmount: target,
        savedAmount: saved,
      };

      if (editingId !== null) {
        await updateGoal(editingId, payload);
      } else {
        await createGoal(payload);
      }

      reset();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openContribution = (goal) => {
    setContributionGoal(goal);
    setContribution("");
    setError("");
    setShowForm(false);
  };

  const addContribution = async (event) => {
    event.preventDefault();

    if (!contributionGoal) return;

    const amount = Number(contribution);
    const current = Number(contributionGoal.savedAmount);
    const target = Number(contributionGoal.targetAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a contribution greater than ₹0.");
      return;
    }

    if (current + amount > target) {
      setError(
        `You can add up to ${money(target - current)} to this goal.`
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateGoal(contributionGoal.id, {
        savedAmount: current + amount,
      });

      setContributionGoal(null);
      setContribution("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this savings goal?")) return;

    try {
      setError("");
      await deleteGoal(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="page-heading">
          <div>
            <span className="eyebrow">MAKE ROOM FOR WHAT MATTERS</span>
            <h1>Financial goals</h1>
            <p className="muted">
              Turn your plans into milestones and track your progress.
            </p>
          </div>

          <button
            className="button-primary"
            onClick={() => {
              reset();
              setShowForm(!showForm);
              setContributionGoal(null);
            }}
          >
            {showForm ? "Close form" : "+ Create goal"}
          </button>
        </div>

        <div className="summary-grid compact-grid">
          <article className="summary-card">
            <p>Total goal target</p>
            <h2>{money(targetTotal)}</h2>
          </article>

          <article className="summary-card">
            <p>Total saved</p>
            <h2 className="positive">{money(savedTotal)}</h2>
          </article>

          <article className="summary-card">
            <p>Still to save</p>
            <h2>{money(Math.max(targetTotal - savedTotal, 0))}</h2>
          </article>

          <article className="summary-card">
            <p>Completed goals</p>
            <h2>{completedGoals}/{goals.length}</h2>
          </article>
        </div>

        {error && <p className="form-error page-error">{error}</p>}

        {showForm && (
          <section className="panel form-panel">
            <h2>{editingId !== null ? "Edit goal" : "Create a savings goal"}</h2>

            <form className="data-form" onSubmit={submit}>
              <label>
                Goal name
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Emergency fund"
                  maxLength={80}
                  required
                />
              </label>

              <label>
                Target amount (₹)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.targetAmount}
                  onChange={(e) =>
                    setForm({ ...form, targetAmount: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Already saved (₹)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.savedAmount}
                  onChange={(e) =>
                    setForm({ ...form, savedAmount: e.target.value })
                  }
                  required
                />
              </label>

              <div className="form-actions">
                <button className="button-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save goal"}
                </button>

                <button
                  type="button"
                  className="button-secondary"
                  onClick={reset}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {contributionGoal && (
          <section className="panel form-panel">
            <h2>Add contribution</h2>

            <p className="muted">
              Adding money to: <strong>{contributionGoal.title}</strong>
            </p>

            <p>
              Current savings: {money(contributionGoal.savedAmount)}
            </p>

            <p>
              Remaining target:{" "}
              {money(
                Number(contributionGoal.targetAmount) -
                  Number(contributionGoal.savedAmount)
              )}
            </p>

            <form className="data-form" onSubmit={addContribution}>
              <label>
                Contribution amount (₹)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  placeholder="Enter amount to add"
                  required
                />
              </label>

              <div className="form-actions">
                <button className="button-primary" disabled={saving}>
                  {saving ? "Adding..." : "Add contribution"}
                </button>

                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setContributionGoal(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Your savings goals</h2>
              <p className="muted">
                Track your progress towards every financial milestone.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="empty-state">Loading goals...</p>
          ) : goals.length === 0 ? (
            <div className="empty-state">
              <strong>No goals created yet</strong>
              <p>Start with something you're saving towards.</p>
            </div>
          ) : (
            <div className="goal-grid">
              {goals.map((goal) => {
                const target = Number(goal.targetAmount);
                const saved = Number(goal.savedAmount);
                const remaining = Math.max(target - saved, 0);
                const percentage = Math.min((saved / target) * 100, 100);
                const complete = saved >= target;

                return (
                  <article className="goal-card" key={goal.id}>
                    <div className="goal-card-top">
                      <div className="goal-symbol">◎</div>

                      <div className="row-actions">
                        <button
                          className="text-button"
                          onClick={() => edit(goal)}
                        >
                          Edit
                        </button>

                        <button
                          className="text-button danger-text"
                          onClick={() => remove(goal.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <h3>{goal.title}</h3>

                    <div className="goal-progress-copy">
                      <strong>{money(saved)}</strong>
                      <span>of {money(target)}</span>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill goal-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="budget-foot">
                      <span>
                        {complete
                          ? "Goal completed"
                          : `${percentage.toFixed(0)}% completed`}
                      </span>

                      <span>{money(remaining)} left</span>
                    </div>

                    {!complete && (
                      <button
                        className="button-secondary"
                        onClick={() => openContribution(goal)}
                      >
                        + Add contribution
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
