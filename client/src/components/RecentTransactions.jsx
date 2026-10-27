function RecentTransactions({ transactions = [] }) {
  return (
    <div className="transactions-card">
      <div className="transactions-header">
        <h2>Recent Transactions</h2>
        <button>View All</button>
      </div>

      <div className="transaction-list">
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          transactions.map((transaction) => {
            const isIncome = transaction.type === "income";

            return (
              <div className="transaction-item" key={transaction.id}>
                <div>
                  <h3>{transaction.title}</h3>
                  <p>{transaction.category}</p>
                </div>

                <span
                  className={
                    isIncome
                      ? "transaction-income"
                      : "transaction-expense"
                  }
                >
                  {isIncome ? "+" : "-"}₹
                  {Number(transaction.amount).toLocaleString("en-IN")}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecentTransactions;