import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, savedAmount } = req.body;

    if (!title || targetAmount === undefined) {
      return res.status(400).json({
        message: "Title and target amount are required"
      });
    }

    if (Number(targetAmount) <= 0) {
      return res.status(400).json({
        message: "Target amount must be greater than 0"
      });
    }

    if (savedAmount !== undefined && Number(savedAmount) < 0) {
      return res.status(400).json({
        message: "Saved amount cannot be negative"
      });
    }

    if (
      savedAmount !== undefined &&
      Number(savedAmount) > Number(targetAmount)
    ) {
      return res.status(400).json({
        message: "Saved amount cannot exceed target amount"
      });
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        targetAmount: Number(targetAmount),
        savedAmount: savedAmount !== undefined
          ? Number(savedAmount)
          : 0,
        userId: req.user.userId
      }
    });

    res.status(201).json({
      message: "Goal created successfully",
      goal
    });

  } catch (error) {
    console.error("Create goal error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

export const getGoals = async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: {
        userId: req.user.userId
      },
      orderBy: {
        id: "desc"
      }
    });

    res.status(200).json({
      goals
    });

  } catch (error) {
    console.error("Get goals error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
export const updateGoal = async (req, res) => {
  try {
    const goalId = Number(req.params.id);
    const { title, targetAmount, savedAmount } = req.body;

    if (isNaN(goalId)) {
      return res.status(400).json({
        message: "Invalid goal ID"
      });
    }

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.user.userId
      }
    });

    if (!existingGoal) {
      return res.status(404).json({
        message: "Goal not found"
      });
    }

    const newTargetAmount =
      targetAmount !== undefined
        ? Number(targetAmount)
        : existingGoal.targetAmount;

    const newSavedAmount =
      savedAmount !== undefined
        ? Number(savedAmount)
        : existingGoal.savedAmount;

    if (newTargetAmount <= 0) {
      return res.status(400).json({
        message: "Target amount must be greater than 0"
      });
    }

    if (newSavedAmount < 0) {
      return res.status(400).json({
        message: "Saved amount cannot be negative"
      });
    }

    if (newSavedAmount > newTargetAmount) {
      return res.status(400).json({
        message: "Saved amount cannot exceed target amount"
      });
    }

    const updatedGoal = await prisma.goal.update({
      where: {
        id: goalId
      },
      data: {
        ...(title !== undefined && { title }),
        ...(targetAmount !== undefined && {
          targetAmount: newTargetAmount
        }),
        ...(savedAmount !== undefined && {
          savedAmount: newSavedAmount
        })
      }
    });

    res.status(200).json({
      message: "Goal updated successfully",
      goal: updatedGoal
    });

  } catch (error) {
    console.error("Update goal error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goalId = Number(req.params.id);

    if (isNaN(goalId)) {
      return res.status(400).json({
        message: "Invalid goal ID"
      });
    }

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.user.userId
      }
    });

    if (!existingGoal) {
      return res.status(404).json({
        message: "Goal not found"
      });
    }

    await prisma.goal.delete({
      where: {
        id: goalId
      }
    });

    res.status(200).json({
      message: "Goal deleted successfully"
    });

  } catch (error) {
    console.error("Delete goal error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};