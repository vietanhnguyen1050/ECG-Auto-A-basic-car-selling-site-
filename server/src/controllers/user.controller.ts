import type { Request, Response } from "express";
import { User } from "../models/user.model.ts";
import { getUserAndPopulate } from "../middlewares/user.middleware.ts";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        // add other user properties if needed
      };
    }
  }
}

async function addFavorites(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { carId } = req.body;
    const user = await getUserAndPopulate(userId, null);
    if (user.favoritecars.includes(carId)) {
      res.status(200).json({ message: "Car already in favorites" });
    } else {
      user.favoritecars.push(carId);
      await user.save();
      res.status(200).json({ message: "Car added to favorites" });
    }
  } catch (error: Error | any) {
    res.status(500).json({ message: "Server error", error: error?.message });
  }
}

async function deleteFavorites(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { carId } = req.body;
    const user = await getUserAndPopulate(userId, null);

    if (!user.favoritecars.includes(carId)) {
      res.status(200).json({ message: "Car not in favorites" });
      return;
    } else {
      user.favoritecars = user.favoritecars.filter(
        (id) => id.toString() !== carId,
      );
      await user.save();
      res.status(200).json({ message: "Car removed from favorites" });
    }
  } catch (error: Error | any) {
    res.status(500).json({ message: "Server error", error: error?.message });
  }
}

async function getFavorites(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(userId).populate("favoritecars");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ favoritecars: user.favoritecars });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Server error", error: error?.message });
  }
}

async function getUserInfo(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Server error", error: error?.message });
  }
}

export { addFavorites, deleteFavorites, getFavorites, getUserInfo };