import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Overview", end: true, icon: "◫" },
  { to: "/transactions", label: "Transactions", icon: "⇄" },
  { to: "/budgets", label: "Budgets", icon: "▤" },
  { to: "/goals", label: "Goals", icon: "◎" },
  { to: "/ai-assistant", label: "AI Assistant", icon: "✳" },
  { to: "/reports", label: "Reports", icon: "▥" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };
  return <aside className="sidebar">
    <div className="sidebar-brand"><div className="brand-mark small">FP</div><div><strong>FinPilot</strong><span>PERSONAL FINANCE</span></div></div>
    <p className="nav-caption">WORKSPACE</p>
    <nav className="sidebar-nav">{links.map(link => <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><span className="nav-icon">{link.icon}</span>{link.label}</NavLink>)}</nav>
    <div className="sidebar-bottom"><div className="user-chip"><div className="avatar">{(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}</div><div className="user-details"><strong>{user?.name || "Your account"}</strong><span>{user?.email || "Signed in"}</span></div></div><button className="logout-button" onClick={handleLogout}>↪ <span>Log out</span></button></div>
  </aside>;
}
