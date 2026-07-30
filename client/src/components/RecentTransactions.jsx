function RecentTransactions() {
  const transactions = [
    {
      id: 1,
      name: 'Swiggy',
      category: 'Food',
      amount: -450,
    },
    {
      id: 2,
      name: 'Salary',
      category: 'Income',
      amount: 65000,
    },
    {
      id: 3,
      name: 'Uber',
      category: 'Transport',
      amount: -320,
    },
    {
      id: 4,
      name: 'Amazon',
      category: 'Shopping',
      amount: -2499,
    },
  ]

  return (
    <div className="transactions-card">
      <div className="transactions-header">
        <h2>Recent Transactions</h2>
        <button>View All</button>
      </div>

      <div className="transaction-list">
        {transactions.map((transaction) => (
          <div className="transaction-item" key={transaction.id}>
            <div>
              <h3>{transaction.name}</h3>
              <p>{transaction.category}</p>
            </div>

            <span
              className={
                transaction.amount > 0
                  ? 'transaction-income'
                  : 'transaction-expense'
              }
            >
              {transaction.amount > 0 ? '+' : '-'}₹
              {Math.abs(transaction.amount).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentTransactions