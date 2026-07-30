import RecentTransactions from '../components/RecentTransactions'
import Sidebar from '../components/Sidebar'
import SummaryCard from '../components/SummaryCard'

function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your financial overview.</p>

        <div className="summary-grid">
          <SummaryCard title="Total Balance" amount="₹84,250" />
          <SummaryCard title="Income" amount="₹65,000" />
          <SummaryCard title="Expenses" amount="₹31,450" />
          <SummaryCard title="Savings" amount="₹33,550" />
        </div>

        <RecentTransactions />
        
      </main>
    </div>
  )
}

export default Dashboard