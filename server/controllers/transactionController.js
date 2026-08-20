import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createTransaction = async (req, res) => {
  try {
    const { title, amount, category, type, date } = req.body;

    if (!title || amount === undefined || !category || !type) {
      return res.status(400).json({
        message: "Title, amount, category and type are required"
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type must be income or expense"
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: Number(amount),
        category,
        type,
        date: date ? new Date(date) : new Date(),
        userId: req.user.userId
      }
    });

    res.status(201).json({
      message: "Transaction created successfully",
      transaction
    });

  } catch (error) {
    console.error("Create transaction error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
export const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        date: "desc"
      }
    });

    res.status(200).json({
      transactions
    });

  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
export const updateTransaction = async (req, res) => {
  try {
    const transactionId = Number(req.params.id);
    const { title, amount, category, type, date } = req.body;

    if (isNaN(transactionId)) {
      return res.status(400).json({
        message: "Invalid transaction ID"
      });
    }

    // Find the transaction
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: req.user.userId
      }
    });

    // Make sure it belongs to the logged-in user
    if (!existingTransaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    if (type && !["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type must be income or expense"
      });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: {
        id: transactionId
      },
      data: {
        ...(title !== undefined && { title }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(category !== undefined && { category }),
        ...(type !== undefined && { type }),
        ...(date !== undefined && { date: new Date(date) })
      }
    });

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction
    });

  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
export const deleteTransaction = async (req, res) => {
  try {
    const transactionId = Number(req.params.id);

    if (isNaN(transactionId)) {
      return res.status(400).json({
        message: "Invalid transaction ID"
      });
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: req.user.userId
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    await prisma.transaction.delete({
      where: {
        id: transactionId
      }
    });

    res.status(200).json({
      message: "Transaction deleted successfully"
    });

  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};