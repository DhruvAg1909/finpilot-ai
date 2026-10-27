
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createGoal = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const targetAmount = Number(req.body.targetAmount);
    const savedAmount =
      req.body.savedAmount === undefined
        ? 0
        : Number(req.body.savedAmount);

    if (
      !title ||
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0 ||
      !Number.isFinite(savedAmount) ||
      savedAmount < 0 ||
      savedAmount > targetAmount
    ) {
      return res.status(400).json({
        message: "Enter a valid title, target and saved amount.",
      });
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        targetAmount,
        savedAmount,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      message: "Goal created successfully",
      goal,
    });
  } catch (error) {
    console.error("Create goal error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getGoals = async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.userId },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({ goals });
  } catch (error) {
    console.error("Get goals error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const goalId = Number(req.params.id);
    const { title, targetAmount, savedAmount } = req.body;

    if (!Number.isInteger(goalId) || goalId <= 0) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.user.userId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const newTitle =
      title !== undefined ? String(title).trim() : existingGoal.title;

    const newTarget =
      targetAmount !== undefined
        ? Number(targetAmount)
        : existingGoal.targetAmount;

    const newSaved =
      savedAmount !== undefined
        ? Number(savedAmount)
        : existingGoal.savedAmount;

    if (
      !newTitle ||
      !Number.isFinite(newTarget) ||
      newTarget <= 0 ||
      !Number.isFinite(newSaved) ||
      newSaved < 0 ||
      newSaved > newTarget
    ) {
      return res.status(400).json({
        message: "Invalid goal details or amounts.",
      });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        title: newTitle,
        targetAmount: newTarget,
        savedAmount: newSaved,
      },
    });

    return res.status(200).json({
      message: "Goal updated successfully",
      goal: updatedGoal,
    });
  } catch (error) {
    console.error("Update goal error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goalId = Number(req.params.id);

    if (!Number.isInteger(goalId) || goalId <= 0) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.user.userId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });

    return res.status(200).json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Delete goal error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
