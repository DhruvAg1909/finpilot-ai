function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">FinPilot AI</h2>

      <nav className="sidebar-nav">
        <p className="active">Dashboard</p>
        <p>Transactions</p>
        <p>Budgets</p>
        <p>Goals</p>
        <p>AI Assistant</p>
      </nav>
    </aside>
  )
}

export default Sidebar