import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBudget = async (req, res) => {
  try {
    const { category, amount } = req.body;

    if (!category || amount === undefined) {
      return res.status(400).json({
        message: "Category and amount are required"
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0"
      });
    }

    const budget = await prisma.budget.create({
      data: {
        category,
        amount: Number(amount),
        userId: req.user.userId
      }
    });

    res.status(201).json({
      message: "Budget created successfully",
      budget
    });

  } catch (error) {
    console.error("Create budget error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
export const getBudgets = async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        id: "desc"
      }
    });

    res.status(200).json({
      budgets
    });

  } catch (error) {
    console.error("Get budgets error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
export const updateBudget = async (req, res) => {
  try {
    const budgetId = Number(req.params.id);
    const { category, amount } = req.body;

    if (isNaN(budgetId)) {
      return res.status(400).json({
        message: "Invalid budget ID"
      });
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId: req.user.userId
      }
    });

    if (!existingBudget) {
      return res.status(404).json({
        message: "Budget not found"
      });
    }

    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0"
      });
    }

    const updatedBudget = await prisma.budget.update({
      where: {
        id: budgetId
      },
      data: {
        ...(category !== undefined && { category }),
        ...(amount !== undefined && { amount: Number(amount) })
      }
    });

    res.status(200).json({
      message: "Budget updated successfully",
      budget: updatedBudget
    });

  } catch (error) {
    console.error("Update budget error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
export const deleteBudget = async (req, res) => {
  try {
    const budgetId = Number(req.params.id);

    if (isNaN(budgetId)) {
      return res.status(400).json({
        message: "Invalid budget ID"
      });
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId: req.user.userId
      }
    });

    if (!existingBudget) {
      return res.status(404).json({
        message: "Budget not found"
      });
    }

    await prisma.budget.delete({
      where: {
        id: budgetId
      }
    });

    res.status(200).json({
      message: "Budget deleted successfully"
    });

  } catch (error) {
    console.error("Delete budget error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};