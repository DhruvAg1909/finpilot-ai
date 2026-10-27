
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBudget = async (req, res) => {
  try {
    const category = String(req.body.category || "").trim();
    const amount = Number(req.body.amount);

    if (!category || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Enter a valid category and amount greater than 0",
      });
    }

    const budget = await prisma.budget.create({
      data: {
        category,
        amount,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    console.error("Create budget error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.user.userId },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({ budgets });
  } catch (error) {
    console.error("Get budgets error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budgetId = Number(req.params.id);
    const { category, amount } = req.body;

    if (!Number.isInteger(budgetId) || budgetId <= 0) {
      return res.status(400).json({ message: "Invalid budget ID" });
    }

    if (category !== undefined &&
        (typeof category !== "string" || !category.trim())) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (amount !== undefined &&
        (!Number.isFinite(Number(amount)) || Number(amount) <= 0)) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId: req.user.userId,
      },
    });

    if (!existingBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const updatedBudget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        ...(category !== undefined && { category: category.trim() }),
        ...(amount !== undefined && { amount: Number(amount) }),
      },
    });

    return res.status(200).json({
      message: "Budget updated successfully",
      budget: updatedBudget,
    });
  } catch (error) {
    console.error("Update budget error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budgetId = Number(req.params.id);

    if (!Number.isInteger(budgetId) || budgetId <= 0) {
      return res.status(400).json({ message: "Invalid budget ID" });
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId: req.user.userId,
      },
    });

    if (!existingBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return res.status(200).json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
