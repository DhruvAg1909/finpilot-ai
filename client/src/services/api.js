const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api").replace(/\/$/, "");

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === "object" && data !== null ? data.message : data;
    throw new Error(message || `Request failed (${response.status})`);
  }
  return data;
};

export const loginUser = (credentials) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
export const registerUser = (details) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(details) });
export const getCurrentUser = () => apiRequest("/auth/me");

export const getTransactions = () => apiRequest("/transactions");
export const createTransaction = (payload) => apiRequest("/transactions", { method: "POST", body: JSON.stringify(payload) });
export const updateTransaction = (id, payload) => apiRequest(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteTransaction = (id) => apiRequest(`/transactions/${id}`, { method: "DELETE" });

export const getBudgets = () => apiRequest("/budgets");
export const createBudget = (payload) => apiRequest("/budgets", { method: "POST", body: JSON.stringify(payload) });
export const updateBudget = (id, payload) => apiRequest(`/budgets/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteBudget = (id) => apiRequest(`/budgets/${id}`, { method: "DELETE" });

export const getGoals = () => apiRequest("/goals");
export const createGoal = (payload) => apiRequest("/goals", { method: "POST", body: JSON.stringify(payload) });
export const updateGoal = (id, payload) => apiRequest(`/goals/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteGoal = (id) => apiRequest(`/goals/${id}`, { method: "DELETE" });
