import { User } from "../models/user.model.js";

async function getUserAndPopulate(userId: any, population: any) {
  try {
    if (!userId) {
      throw new Error("Không có quyền truy cập");
    }
    let user;
    if (population) {
      user = await User.findById(userId).populate(population);
    } else {
      user = await User.findById(userId);
    }
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }
    return user;
  } catch (error) {
    throw new Error("Lỗi middleware");
  }
}

export { getUserAndPopulate };

