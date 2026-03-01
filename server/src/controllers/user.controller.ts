import type { Request, Response } from "express";
import { User } from "../models/user.model.ts";
import { getUserAndPopulate } from "../middlewares/user.middleware.ts";

async function addFavorites(req: Request, res: Response) {
  try {
    const userId = (req as any)?.user?.userid;
    const { carId } = req.body;
    const user = await getUserAndPopulate(userId, null);
    if (user.favoritecars.includes(carId)) {
      res.status(200).json({ message: "Xe đã có trong danh sách yêu thích" });
    } else {
      user.favoritecars.push(carId);
      await user.save();
      res.status(200).json({ message: "Đã thêm xe vào danh sách yêu thích" });
    }
  } catch (error: Error | any) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

async function deleteFavorites(req: Request, res: Response) {
  try {
    const userId = (req as any)?.user?.userid;
    const { carId } = req.body;
    const user = await getUserAndPopulate(userId, null);

    if (!user.favoritecars.includes(carId)) {
      res.status(200).json({ message: "Xe không có trong danh sách yêu thích" });
      return;
    } else {
      user.favoritecars = user.favoritecars.filter(
        (id) => id.toString() !== carId,
      );
      await user.save();
      res.status(200).json({ message: "Đã xóa xe khỏi danh sách yêu thích" });
    }
  } catch (error: Error | any) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

async function getFavorites(req: Request, res: Response) {
  try {
    const userId = (req as any)?.user?.userid;
    if (!userId) {
      return res.status(401).json({ message: "Không có quyền truy cập" });
    }
    const user = await User.findById(userId).populate("favoritecars");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ favoritecars: user.favoritecars });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

async function getUserInfo(req: Request, res: Response) {
  try {
    const userId = (req as any)?.user?.userid;
    if (!userId) {
      return res.status(401).json({ message: "Không có quyền truy cập" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ user });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

async function updateUserInfo(req: Request, res: Response) {
  try {
    const userId = (req as any)?.user?.userid;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.status(200).json({ user: updatedUser });
  } catch (error: Error | any) {
    res.status(500).json({ message: "Lỗi máy chủ", error: error?.message });
  }
}

export { addFavorites, deleteFavorites, getFavorites, getUserInfo, updateUserInfo };