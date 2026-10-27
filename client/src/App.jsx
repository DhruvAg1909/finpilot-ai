import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import "./App.css";

function Placeholder({ title, description }) {
  return <div className="dashboard-layout"><Sidebar /><main className="dashboard-main"><span className="eyebrow">COMING IN THE NEXT STAGE</span><h1>{title}</h1><p className="muted">{description}</p></main></div>;
}
const Private = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;
export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
    <Route path="/" element={<Private><Dashboard /></Private>} />
    <Route path="/transactions" element={<Private><Transactions /></Private>} />
    <Route path="/budgets" element={<Private><Budgets /></Private>} />
    <Route path="/goals" element={<Private><Goals /></Private>} />
    <Route path="/ai-assistant" element={<Private><Placeholder title="AI Financial Assistant" description="Your AI-powered spending insights and planning tools are coming in Stage 3." /></Private>} />
    <Route path="/reports" element={<Private><Placeholder title="Reports" description="Monthly reports and financial trends are coming in Stage 3." /></Private>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
